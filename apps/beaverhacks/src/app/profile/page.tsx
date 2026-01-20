import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Image from "next/image";
import {
  Mail,
  Calendar,
  GraduationCap,
  Building2,
  FileText,
  CheckCircle2,
  Clock,
} from "lucide-react";

import { auth } from "@repo/auth";
import { prisma } from "@repo/database";
import { LogoutButton } from "@/components/logout-button";

const Profile = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login?callbackURL=/profile");
  }

  const user = session.user;

  const application = await prisma.application.findUnique({
    where: { userId: user.id },
  });

  if (!application) redirect("/apply");

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "CHECKED_IN":
        return {
          label: "Checked In",
          icon: CheckCircle2,
          color: "text-emerald-400",
          bg: "bg-emerald-400/10",
          border: "border-emerald-400/20",
        };
      case "APPLIED":
      default:
        return {
          label: "Application Submitted",
          icon: Clock,
          color: "text-amber-400",
          bg: "bg-amber-400/10",
          border: "border-amber-400/20",
        };
    }
  };

  const statusConfig = getStatusConfig(application.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900/50 via-black to-black" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-b from-neutral-800/20 to-transparent rounded-full blur-3xl" />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Dashboard */}
      <div className="w-full max-w-lg relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-white">Profile</h1>
          <LogoutButton />
        </div>

        {/* Main Card */}
        <div className="border border-neutral-800 bg-neutral-950/80 backdrop-blur-sm">
          {/* User Info Section */}
          <div className="p-6 border-b border-neutral-800">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-14 h-14 bg-neutral-800 border border-neutral-700 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span className="text-xl font-semibold text-white">
                    {application.name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {/* User Details */}
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-medium text-white truncate">
                  {application.name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="text-sm text-neutral-400 truncate">
                    {user.email}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="text-xs text-neutral-500">
                    Joined {formatDate(user.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="px-6 py-4 border-b border-neutral-800">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 ${statusConfig.bg} ${statusConfig.border} border`}
            >
              <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
              <span className={`text-sm font-medium ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
            </div>
          </div>

          {/* Application Details */}
          <div className="p-6">
            <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-4">
              Application Details
            </h3>

            <div className="space-y-4">
              {/* University */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-neutral-900 border border-neutral-800 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-4 h-4 text-neutral-500" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500">University</p>
                  <p className="text-sm text-white">{application.university}</p>
                </div>
              </div>

              {/* Graduation Year */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-neutral-900 border border-neutral-800 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-4 h-4 text-neutral-500" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Graduation Year</p>
                  <p className="text-sm text-white">
                    {application.graduationYear}
                  </p>
                </div>
              </div>

              {/* Resume */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-neutral-900 border border-neutral-800 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-neutral-500" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Resume</p>
                  <a
                    href={application.resumePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-neutral-400 hover:text-white transition-colors"
                  >
                    View Resume →
                  </a>
                </div>
              </div>

              {/* Submitted Date */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-neutral-900 border border-neutral-800 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-neutral-500" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Submitted</p>
                  <p className="text-sm text-white">
                    {formatDate(application.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-neutral-600 mt-6">
          Questions? Contact us at{" "}
          <a
            href="mailto:contact@beaverhacks.org"
            className="text-neutral-400 hover:text-white transition-colors"
          >
            contact@beaverhacks.org
          </a>
        </p>
      </div>
    </div>
  );
};

export default Profile;
