import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminStorage } from "@/src/lib/firebase/admin";
import { getOwnerFromRequest } from "@/src/lib/firebase/auth";
import {
  getMeetingById,
  getRecording,
  saveMinutes,
  saveTranscript,
  updateRecordingStatus,
} from "@/src/lib/db/repo";
import { hasGeminiApiKey } from "@/src/lib/gemini/client";
import { getGeminiFallbackModel, getGeminiModel } from "@/src/lib/gemini/selectModel";
import { transcribeWithGemini } from "@/src/lib/gemini/transcribe";
import { generateMinutesWithGemini } from "@/src/lib/gemini/generateMinutes";
import { buildStubMinutes, buildStubTranscript } from "@/src/lib/minutes/stub";
import { renderMinutesMarkdown } from "@/src/lib/minutes/markdown";

export const runtime = "nodejs";

const bodySchema = z.object({
  meetingId: z.string().min(1),
  recordingId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const body = bodySchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Dades no vàlides" }, { status: 400 });
  }

  const owner = await getOwnerFromRequest(request);
  if (!owner) {
    return NextResponse.json({ error: "No autoritzat" }, { status: 401 });
  }

  const meeting = await getMeetingById(body.data.meetingId);
  if (!meeting || meeting.orgId !== owner.orgId) {
    return NextResponse.json({ error: "No autoritzat" }, { status: 403 });
  }

  const recording = await getRecording({
    meetingId: body.data.meetingId,
    recordingId: body.data.recordingId,
  });

  if (!recording) {
    return NextResponse.json({ error: "Gravació no trobada" }, { status: 404 });
  }

  const hasKey = hasGeminiApiKey();
  let selectedModel = getGeminiFallbackModel();
  if (hasKey) {
    selectedModel = await getGeminiModel();
  }

  let mode: "stub" | "real" = "stub";

  try {
    await updateRecordingStatus({
      meetingId: body.data.meetingId,
      recordingId: body.data.recordingId,
      status: "processing",
      error: null,
    });

    let transcriptText = "";

    if (recording.rawText?.trim()) {
      transcriptText = recording.rawText.trim();
    } else if (hasKey && recording.storagePath) {
      try {
        const [bytes] = await adminStorage.bucket().file(recording.storagePath).download();
        const mimeType = recording.mimeType ?? "audio/mpeg";
        transcriptText = await transcribeWithGemini({
          model: selectedModel,
          audioBytes: bytes,
          mimeType,
        });
        mode = "real";
      } catch {
        transcriptText = buildStubTranscript({
          meetingId: body.data.meetingId,
          recordingId: body.data.recordingId,
          rawText: recording.rawText,
        });
      }
    } else {
      transcriptText = buildStubTranscript({
        meetingId: body.data.meetingId,
        recordingId: body.data.recordingId,
        rawText: recording.rawText,
      });
    }

    await saveTranscript({
      meetingId: body.data.meetingId,
      recordingId: body.data.recordingId,
      status: "done",
      text: transcriptText,
    });

    if (hasKey) {
      try {
        const generated = await generateMinutesWithGemini({
          model: selectedModel,
          transcript: transcriptText,
        });

        await saveMinutes({
          meetingId: body.data.meetingId,
          recordingId: body.data.recordingId,
          status: "done",
          minutesMarkdown: generated.minutesMarkdown,
          minutesJson: generated.minutesJson,
        });

        mode = "real";
      } catch {
        const minutesJson = buildStubMinutes(transcriptText);
        await saveMinutes({
          meetingId: body.data.meetingId,
          recordingId: body.data.recordingId,
          status: "done",
          minutesMarkdown: renderMinutesMarkdown(minutesJson),
          minutesJson,
        });
      }
    } else {
      const minutesJson = buildStubMinutes(transcriptText);
      await saveMinutes({
        meetingId: body.data.meetingId,
        recordingId: body.data.recordingId,
        status: "done",
        minutesMarkdown: renderMinutesMarkdown(minutesJson),
        minutesJson,
      });
    }

    await updateRecordingStatus({
      meetingId: body.data.meetingId,
      recordingId: body.data.recordingId,
      status: "done",
      error: null,
    });

    return NextResponse.json({ ok: true, mode, model: selectedModel });
  } catch (error) {
    await updateRecordingStatus({
      meetingId: body.data.meetingId,
      recordingId: body.data.recordingId,
      status: "error",
      error: error instanceof Error ? error.message : "Error de processament",
    });

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error de processament" },
      { status: 500 }
    );
  }
}
