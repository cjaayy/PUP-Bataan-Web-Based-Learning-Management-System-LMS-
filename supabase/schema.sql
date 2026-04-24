-- PUP Bataan Integrated LMS schema

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('student', 'faculty', 'admin')),
  created_at timestamptz default now() not null
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  title text not null,
  section text,
  description text,
  faculty_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now() not null
);

create table if not exists public.course_members (
  course_id uuid not null references public.courses(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('student', 'faculty')),
  joined_at timestamptz default now() not null,
  primary key (course_id, user_id)
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  created_at timestamptz default now() not null
);

create table if not exists public.announcement_comments (
  id uuid primary key default gen_random_uuid(),
  announcement_id uuid not null references public.announcements(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz default now() not null
);

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  instructions text,
  due_at timestamptz,
  max_points int default 100,
  attachment_path text,
  created_at timestamptz default now() not null
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  submission_text text,
  attachment_path text,
  score int,
  feedback text,
  submitted_at timestamptz default now() not null,
  graded_at timestamptz,
  unique (assignment_id, student_id)
);

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.course_members enable row level security;
alter table public.announcements enable row level security;
alter table public.announcement_comments enable row level security;
alter table public.assignments enable row level security;
alter table public.submissions enable row level security;

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.profiles p where p.id = uid and p.role = 'admin'
  );
$$;

drop policy if exists "profiles can view profiles" on public.profiles;
create policy "profiles can view profiles"
on public.profiles
for select
using (auth.uid() = id or public.is_admin(auth.uid()));

drop policy if exists "users can insert own profile" on public.profiles;
create policy "users can insert own profile"
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "members can view courses" on public.courses;
create policy "members can view courses"
on public.courses
for select
using (
  exists (
    select 1 from public.course_members cm
    where cm.course_id = id and cm.user_id = auth.uid()
  )
  or public.is_admin(auth.uid())
);

drop policy if exists "faculty/admin can insert courses" on public.courses;
create policy "faculty/admin can insert courses"
on public.courses
for insert
with check (
  auth.uid() = faculty_id
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('faculty', 'admin')
  )
);

drop policy if exists "course members can view members" on public.course_members;
create policy "course members can view members"
on public.course_members
for select
using (
  exists (
    select 1 from public.course_members mine
    where mine.course_id = course_id and mine.user_id = auth.uid()
  )
  or public.is_admin(auth.uid())
);

drop policy if exists "students can join" on public.course_members;
create policy "students can join"
on public.course_members
for insert
with check (auth.uid() = user_id);

drop policy if exists "members can read announcements" on public.announcements;
create policy "members can read announcements"
on public.announcements
for select
using (
  exists (
    select 1 from public.course_members cm
    where cm.course_id = course_id and cm.user_id = auth.uid()
  )
);

drop policy if exists "faculty can post announcements" on public.announcements;
create policy "faculty can post announcements"
on public.announcements
for insert
with check (
  auth.uid() = author_id and exists (
    select 1 from public.course_members cm
    where cm.course_id = course_id and cm.user_id = auth.uid() and cm.role = 'faculty'
  )
);

drop policy if exists "members can read comments" on public.announcement_comments;
create policy "members can read comments"
on public.announcement_comments
for select
using (
  exists (
    select 1
    from public.announcements a
    join public.course_members cm on cm.course_id = a.course_id
    where a.id = announcement_id and cm.user_id = auth.uid()
  )
);

drop policy if exists "members can comment" on public.announcement_comments;
create policy "members can comment"
on public.announcement_comments
for insert
with check (
  auth.uid() = author_id and exists (
    select 1
    from public.announcements a
    join public.course_members cm on cm.course_id = a.course_id
    where a.id = announcement_id and cm.user_id = auth.uid()
  )
);

drop policy if exists "members can read assignments" on public.assignments;
create policy "members can read assignments"
on public.assignments
for select
using (
  exists (
    select 1 from public.course_members cm
    where cm.course_id = course_id and cm.user_id = auth.uid()
  )
);

drop policy if exists "faculty can create assignments" on public.assignments;
create policy "faculty can create assignments"
on public.assignments
for insert
with check (
  auth.uid() = created_by and exists (
    select 1 from public.course_members cm
    where cm.course_id = course_id and cm.user_id = auth.uid() and cm.role = 'faculty'
  )
);

drop policy if exists "students and faculty can read submissions" on public.submissions;
create policy "students and faculty can read submissions"
on public.submissions
for select
using (
  auth.uid() = student_id or exists (
    select 1
    from public.assignments a
    join public.course_members cm on cm.course_id = a.course_id
    where a.id = assignment_id and cm.user_id = auth.uid() and cm.role = 'faculty'
  )
);

drop policy if exists "student can submit" on public.submissions;
create policy "student can submit"
on public.submissions
for insert
with check (auth.uid() = student_id);

drop policy if exists "faculty can grade" on public.submissions;
create policy "faculty can grade"
on public.submissions
for update
using (
  exists (
    select 1
    from public.assignments a
    join public.course_members cm on cm.course_id = a.course_id
    where a.id = assignment_id and cm.user_id = auth.uid() and cm.role = 'faculty'
  )
)
with check (true);

insert into storage.buckets (id, name, public)
values ('course-files', 'course-files', false)
on conflict (id) do nothing;

drop policy if exists "authenticated can upload files" on storage.objects;
create policy "authenticated can upload files"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'course-files');

drop policy if exists "members can read files" on storage.objects;
create policy "members can read files"
on storage.objects
for select
to authenticated
using (bucket_id = 'course-files');
