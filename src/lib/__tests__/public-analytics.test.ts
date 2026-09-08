import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getPublicContactMethod,
  isValidGaMeasurementId,
  trackPublicAnalyticsEvent,
  PUBLIC_ANALYTICS_CONSENT_KEY,
  readPublicAnalyticsConsent,
  writePublicAnalyticsConsent,
  clearPublicAnalyticsConsent,
} from '@/lib/public-analytics';

test('GA4 measurement IDs must use the public G- format', () => {
  assert.equal(isValidGaMeasurementId('G-ABC123DEF4'), true);
  assert.equal(isValidGaMeasurementId(' G-ABC123DEF4 '), true);
  assert.equal(isValidGaMeasurementId('UA-123-1'), false);
  assert.equal(isValidGaMeasurementId(''), false);
  assert.equal(isValidGaMeasurementId(undefined), false);
});

test('contact links are classified without reading personal form data', () => {
  assert.equal(getPublicContactMethod('/ca/contact'), 'contact_page');
  assert.equal(getPublicContactMethod('https://summasocial.app/es/contact?plan=initial'), 'contact_page');
  assert.equal(getPublicContactMethod('mailto:hola@summasocial.app'), 'email');
  assert.equal(getPublicContactMethod('tel:+34684765359'), 'phone');
  assert.equal(getPublicContactMethod('https://wa.me/34684765359'), 'whatsapp');
  assert.equal(getPublicContactMethod('/ca/privacy'), null);
  assert.equal(getPublicContactMethod('https://example.com/contact'), null);
});

test('analytics events are inert during server rendering', () => {
  assert.equal(trackPublicAnalyticsEvent('generate_lead', { form_id: 'public_contact' }), false);
});

test('browser events require explicit consent, and withdrawing it stops subsequent events', () => {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const storage = new Map<string, string>();
  const events: unknown[][] = [];
  Object.defineProperty(globalThis, 'window', { configurable: true, value: {
    localStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    },
    gtag: (...args: unknown[]) => events.push(args),
  } });
  try {
    assert.equal(trackPublicAnalyticsEvent('contact_intent'), false);
    writePublicAnalyticsConsent('denied');
    assert.equal(trackPublicAnalyticsEvent('generate_lead'), false);
    assert.equal(events.length, 0);
    writePublicAnalyticsConsent('granted');
    assert.equal(storage.get(PUBLIC_ANALYTICS_CONSENT_KEY), 'granted');
    assert.equal(trackPublicAnalyticsEvent('generate_lead', {
      form_id: 'public_contact', plan_id: undefined, unused: null,
    }), true);
    assert.deepEqual(events, [['event', 'generate_lead', { form_id: 'public_contact' }]]);
    clearPublicAnalyticsConsent();
    assert.equal(readPublicAnalyticsConsent(), null);
    assert.equal(trackPublicAnalyticsEvent('contact_intent'), false);
    assert.equal(events.length, 1);
  } finally {
    if (previousWindow) Object.defineProperty(globalThis, 'window', previousWindow);
    else Reflect.deleteProperty(globalThis, 'window');
  }
});

test('blocked browser storage cannot enable analytics or break preference handling', () => {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  Object.defineProperty(globalThis, 'window', { configurable: true, value: {
    localStorage: {
      getItem() { throw new Error('storage blocked'); },
      setItem() { throw new Error('storage blocked'); },
      removeItem() { throw new Error('storage blocked'); },
    },
    gtag() { assert.fail('analytics must not run without readable consent'); },
  } });
  try {
    assert.equal(readPublicAnalyticsConsent(), null);
    assert.doesNotThrow(() => writePublicAnalyticsConsent('granted'));
    assert.doesNotThrow(() => clearPublicAnalyticsConsent());
    assert.equal(trackPublicAnalyticsEvent('generate_lead'), false);
  } finally {
    if (previousWindow) Object.defineProperty(globalThis, 'window', previousWindow);
    else Reflect.deleteProperty(globalThis, 'window');
  }
});
