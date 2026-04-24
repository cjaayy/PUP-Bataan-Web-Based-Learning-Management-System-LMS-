"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createCourseCode } from "@/lib/utils";

function getText(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

async function uploadOptionalFile(file: File | null, folder: string) {
  if (!file || file.size === 0) {
    return null;
  }

  const supabase = await createClient();
  const ext = file.name.split(".").pop() || "bin";
  const filePath = `${folder}/${randomUUID()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from("course-files")
    .upload(filePath, bytes, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return filePath;
}

export async function createCourseAction(formData: FormData) {
  const { profile } = await requireUser();

  if (profile.role === "student") {
    redirect(
      "/courses?error=Only%20faculty%20or%20admin%20can%20create%20courses",
    );
  }

  const title = getText(formData, "title");
  const section = getText(formData, "section");
  const description = getText(formData, "description");
  const code = getText(formData, "code") || createCourseCode(title);
  const supabase = await createClient();

  const { data: course, error } = await supabase
    .from("courses")
    .insert({
      title,
      section,
      description,
      code,
      faculty_id: profile.id,
    })
    .select("id")
    .single();

  if (error || !course) {
    redirect(
      `/courses/create?error=${encodeURIComponent(error?.message || "Could not create course")}`,
    );
  }

  await supabase.from("course_members").upsert({
    course_id: course.id,
    user_id: profile.id,
    role: "faculty",
  });

  revalidatePath("/courses");
  redirect(`/courses/${course.id}`);
}

export async function joinCourseAction(formData: FormData) {
  const { profile } = await requireUser();
  const supabase = await createClient();
  const code = getText(formData, "code").toUpperCase();

  const { data: course, error } = await supabase
    .from("courses")
    .select("id")
    .eq("code", code)
    .single();

  if (error || !course) {
    redirect("/join?error=Course%20code%20not%20found");
  }

  const role = profile.role === "student" ? "student" : "faculty";

  const { error: joinError } = await supabase.from("course_members").upsert({
    course_id: course.id,
    user_id: profile.id,
    role,
  });

  if (joinError) {
    redirect(`/join?error=${encodeURIComponent(joinError.message)}`);
  }

  revalidatePath("/courses");
  redirect(`/courses/${course.id}`);
}

export async function createAnnouncementAction(formData: FormData) {
  const { profile } = await requireUser();
  const supabase = await createClient();
  const courseId = getText(formData, "course_id");
  const title = getText(formData, "title");
  const body = getText(formData, "body");

  const { error } = await supabase.from("announcements").insert({
    course_id: courseId,
    author_id: profile.id,
    title,
    body,
  });

  if (error) {
    redirect(`/courses/${courseId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/courses/${courseId}`);
  redirect(`/courses/${courseId}`);
}

export async function commentOnAnnouncementAction(formData: FormData) {
  const { profile } = await requireUser();
  const supabase = await createClient();
  const announcementId = getText(formData, "announcement_id");
  const courseId = getText(formData, "course_id");
  const body = getText(formData, "body");

  const { error } = await supabase.from("announcement_comments").insert({
    announcement_id: announcementId,
    author_id: profile.id,
    body,
  });

  if (error) {
    redirect(`/courses/${courseId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/courses/${courseId}`);
  redirect(`/courses/${courseId}`);
}

export async function createAssignmentAction(formData: FormData) {
  const { profile } = await requireUser();

  if (profile.role === "student") {
    redirect("/courses?error=Only%20faculty%20can%20create%20assignments");
  }

  const supabase = await createClient();
  const courseId = getText(formData, "course_id");
  const title = getText(formData, "title");
  const instructions = getText(formData, "instructions");
  const dueAt = getText(formData, "due_at");
  const maxPoints = Number(getText(formData, "max_points") || "100");
  const file = formData.get("attachment") as File | null;
  const attachmentPath = await uploadOptionalFile(
    file,
    `assignments/${courseId}`,
  );

  const { error } = await supabase.from("assignments").insert({
    course_id: courseId,
    created_by: profile.id,
    title,
    instructions,
    due_at: dueAt ? new Date(dueAt).toISOString() : null,
    max_points: maxPoints,
    attachment_path: attachmentPath,
  });

  if (error) {
    redirect(`/courses/${courseId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/courses/${courseId}`);
  redirect(`/courses/${courseId}`);
}

export async function submitAssignmentAction(formData: FormData) {
  const { profile } = await requireUser();
  const supabase = await createClient();
  const assignmentId = getText(formData, "assignment_id");
  const submissionText = getText(formData, "submission_text");
  const file = formData.get("attachment") as File | null;
  const attachmentPath = await uploadOptionalFile(
    file,
    `submissions/${assignmentId}`,
  );

  const { error } = await supabase.from("submissions").upsert({
    assignment_id: assignmentId,
    student_id: profile.id,
    submission_text: submissionText,
    attachment_path: attachmentPath,
    submitted_at: new Date().toISOString(),
  });

  if (error) {
    redirect(
      `/assignments/${assignmentId}?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath(`/assignments/${assignmentId}`);
  redirect(`/assignments/${assignmentId}?saved=1`);
}

export async function gradeSubmissionAction(formData: FormData) {
  await requireUser();
  const supabase = await createClient();
  const submissionId = getText(formData, "submission_id");
  const assignmentId = getText(formData, "assignment_id");
  const score = Number(getText(formData, "score") || "0");
  const feedback = getText(formData, "feedback");

  const { error } = await supabase
    .from("submissions")
    .update({ score, feedback, graded_at: new Date().toISOString() })
    .eq("id", submissionId);

  if (error) {
    redirect(
      `/assignments/${assignmentId}?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath(`/assignments/${assignmentId}`);
  redirect(`/assignments/${assignmentId}`);
}

export async function getSignedFileUrl(path: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("course-files")
    .createSignedUrl(path, 60);

  if (error) {
    return null;
  }

  return data.signedUrl;
}
