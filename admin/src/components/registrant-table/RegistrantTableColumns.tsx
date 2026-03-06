import { truncateText } from "@/lib/table-actions";
import { FormEntry, StatusType } from "@/types/form-entries";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  CheckCircle,
  Clock,
  Copy,
  Eye,
  MoreHorizontal,
  Trash2,
  UserCheck,
  UserX,
  XCircle,
  Send,
  Loader2,
} from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { RegistrantDetailsDialog } from "./RegistrantDetailsDialog";
import { sendQREmails } from "@/app/actions/send-qr-emails";

interface Props {
  isUpdating: number | null;
  onDataChange: () => void;
  toggleCheckIn: (registrant: FormEntry) => void;
  updateRegistrantStatus: (id: number, status: StatusType) => void;
  deleteRegistrant: (id: number) => void;
}

// Action Cell Component
function ActionCell({
  registrant,
  isUpdating,
  toggleCheckIn,
  updateRegistrantStatus,
  deleteRegistrant,
  onDataChange,
}: {
  registrant: FormEntry;
  isUpdating: number | null;
  toggleCheckIn: (registrant: FormEntry) => void;
  updateRegistrantStatus: (id: number, status: StatusType) => void;
  deleteRegistrant: (id: number) => void;
  onDataChange: () => void;
}) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const isAccepted = registrant.status === "accepted";

  const handleSendQREmail = async () => {
    setIsSendingEmail(true);
    try {
      const result = await sendQREmails([registrant.id]);
      if (result.success) {
        alert(`Successfully sent QR email to ${registrant.email}`);
      } else {
        alert(
          `Failed to send email to ${registrant.email}: ${result.errors[0]?.error || "Unknown error"
          }`
        );
      }
    } catch (error) {
      alert(`Failed to send email: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Check-in button: only when accepted */}
      {isAccepted && (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            toggleCheckIn(registrant);
          }}
          className="flex items-center gap-2 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 rounded-full"
          variant={"outline"}
          disabled={isUpdating === registrant.id}
        >
          {registrant.is_checked_in ? (
            <>
              <UserX className="w-4 h-4" />
              <span className="font-bold">Check Out</span>
            </>
          ) : (
            <>
              <UserCheck className="w-4 h-4" />
              <span className="font-bold">Check In</span>
            </>
          )}
        </Button>
      )}

      {/* Accept/Reject buttons: only when not yet accepted */}
      {!isAccepted && (
        <>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              updateRegistrantStatus(registrant.id, "accepted");
            }}
            disabled={isUpdating === registrant.id}
            className="flex items-center gap-2 border-2 border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400 transition-all duration-300 rounded-full"
            variant="outline"
          >
            <CheckCircle className="w-4 h-4" />
            <span className="font-bold">Accept</span>
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              updateRegistrantStatus(registrant.id, "rejected");
            }}
            disabled={isUpdating === registrant.id}
            className="flex items-center gap-2 border-2 border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 transition-all duration-300 rounded-full"
            variant="outline"
          >
            <XCircle className="w-4 h-4" />
            <span className="font-bold">Reject</span>
          </Button>
        </>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 rounded-full">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-white border-gray-200">
          <DropdownMenuLabel className="text-gray-900">Actions</DropdownMenuLabel>

          {/* View Information */}
          <DropdownMenuItem
            onClick={() => setIsDetailsOpen(true)}
            className="flex items-center gap-2 text-gray-900 hover:bg-[#0f9dfe]/10"
          >
            <Eye className="h-4 w-4" />
            <span>View Information</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() =>
              navigator.clipboard.writeText(registrant.email || "")
            }
            className="flex items-center gap-2 text-gray-900 hover:bg-[#0f9dfe]/10"
          >
            <Copy className="h-4 w-4" />
            <span>Copy email</span>
          </DropdownMenuItem>

          {isAccepted && (
            <DropdownMenuItem
              onClick={handleSendQREmail}
              disabled={isSendingEmail}
              className="flex items-center gap-2 text-[#0f9dfe] hover:bg-[#0f9dfe]/10 focus:bg-[#0f9dfe]/10 focus:text-[#0f9dfe]"
            >
              {isSendingEmail ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span>{isSendingEmail ? "Sending..." : "Send QR Email"}</span>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {/* Status Update Actions */}
          <DropdownMenuLabel className="text-xs text-gray-600">
            Update Status
          </DropdownMenuLabel>

          <DropdownMenuItem
            onClick={() => updateRegistrantStatus(registrant.id, "accepted")}
            disabled={
              registrant.status === "accepted" || isUpdating === registrant.id
            }
            className="flex items-center gap-2 text-gray-900 hover:bg-green-50"
          >
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>Accept</span>
            {registrant.status === "accepted" && (
              <Badge className="ml-auto text-xs bg-green-100 text-green-700 border border-green-300">
                Current
              </Badge>
            )}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => updateRegistrantStatus(registrant.id, "pending")}
            disabled={
              registrant.status === "pending" || isUpdating === registrant.id
            }
            className="flex items-center gap-2 text-gray-900 hover:bg-yellow-50"
          >
            <Clock className="w-4 h-4 text-yellow-600" />
            <span>Set Pending</span>
            {registrant.status === "pending" && (
              <Badge className="ml-auto text-xs bg-yellow-100 text-yellow-700 border border-yellow-300">
                Current
              </Badge>
            )}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => updateRegistrantStatus(registrant.id, "waitlisted")}
            disabled={
              registrant.status === "waitlisted" || isUpdating === registrant.id
            }
            className="flex items-center gap-2 text-gray-900 hover:bg-purple-50"
          >
            <Clock className="w-4 h-4 text-purple-600" />
            <span>Set Waitlisted</span>
            {registrant.status === "waitlisted" && (
              <Badge className="ml-auto text-xs bg-yellow-100 text-yellow-700 border border-yellow-300">
                Current
              </Badge>
            )}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => updateRegistrantStatus(registrant.id, "rejected")}
            disabled={
              registrant.status === "rejected" || isUpdating === registrant.id
            }
            className="flex items-center gap-2 text-gray-900 hover:bg-red-50"
          >
            <XCircle className="w-4 h-4 text-red-600" />
            <span>Reject</span>
            {registrant.status === "rejected" && (
              <Badge className="ml-auto text-xs bg-red-100 text-red-700 border border-red-300">
                Current
              </Badge>
            )}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Delete Action */}
          <DropdownMenuItem
            onClick={() => deleteRegistrant(registrant.id)}
            className="flex items-center gap-2 text-red-600 hover:bg-red-50 focus:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RegistrantDetailsDialog
        registrant={registrant}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        onUpdate={onDataChange}
      />
    </div>
  );
}

export default function RegistrantTableColumns({
  isUpdating,
  onDataChange,
  toggleCheckIn,
  updateRegistrantStatus,
  deleteRegistrant,
}: Props): ColumnDef<FormEntry>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) =>
            table.toggleAllPageRowsSelected(!!value)
          }
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
          onClick={(e) => e.stopPropagation()}
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    {
      accessorKey: "first_name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      size: 150,
      minSize: 150,
      filterFn: (row, _columnId, filterValue) => {
        const firstName = row.original.first_name || "";
        const middleName = row.original.middle_name || "";
        const lastName = row.original.last_name || "";
        const suffix = row.original.suffix || "";

        const fullName = [firstName, middleName, lastName, suffix]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return fullName.includes(filterValue.toLowerCase());
      },
      cell: ({ row }) => {
        const firstName = row.getValue("first_name") as string;
        const lastName = row.original.last_name;
        const middleName = row.original.middle_name;
        const suffix = row.original.suffix;

        const fullName = [firstName, middleName, lastName, suffix]
          .filter(Boolean)
          .join(" ");

        return (
          <div className="font-medium min-w-[150px] whitespace-normal break-words">
            {fullName}
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const email = row.getValue("email") as string;
        return <div className="lowercase">{truncateText(email, 30)}</div>;
      },
    },
    {
      accessorKey: "contact_number",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            Contact
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const contactNumber = row.getValue("contact_number") as string;
        return <div>{contactNumber || "N/A"}</div>;
      },
    },
    {
      accessorKey: "spas_id",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            SPAS ID
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const spasId = row.getValue("spas_id") as string | null;
        return <div className="font-mono text-sm">{spasId || "—"}</div>;
      },
    },
    {
      accessorKey: "event_uid",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-gray-700 hover:bg-gray-100 hover:text-gray-900"
        >
          Event UID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const uid = row.original.event_uid;

        if (!uid) {
          return <span className="text-xs text-gray-500">Not generated</span>;
        }

        return (
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-gray-700">{uid}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 border border-gray-300 text-gray-700 hover:bg-gray-100"
              onClick={(event) => {
                event.stopPropagation();
                navigator.clipboard.writeText(uid);
              }}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: "university",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            University
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const university = row.getValue("university") as string;
        const universityCustom = "Other - " + (row.original.university_custom || "");
        const displayValue = university === "Other" ? universityCustom : university;
        return <div className="min-w-[200px] whitespace-normal break-words">{displayValue}</div>;
      },
    },
    {
      accessorKey: "course",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            Course
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const course = row.getValue("course") as string;
        return <div>{truncateText(course, 30)}</div>;
      },
    },
    {
      accessorKey: "scholarship_type",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            Scholarship Type
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const scholarshipType = row.getValue("scholarship_type") as string;
        return <div>{truncateText(scholarshipType, 25)}</div>;
      },
    },
    {
      accessorKey: "year_awarded",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            Year Awarded
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const yearAwarded = row.getValue("year_awarded") as string;
        return <div>{yearAwarded || "N/A"}</div>;
      },
    },
    {
      accessorKey: "seat_assignment",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-gray-700 hover:bg-gray-100 hover:text-gray-900"
        >
          Seat Assignment
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const seat = row.original.seat_assignment;
        return seat ? (
          <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-300">
            {truncateText(seat, 25)}
          </Badge>
        ) : (
          <span className="text-xs text-gray-500">Unassigned</span>
        );
      },
    },
    {
      accessorKey: "preferred_date",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            Preferred Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const preferredDate = row.getValue("preferred_date") as string;
        const badgeColor = preferredDate === "December 13"
          ? "bg-blue-100 text-blue-700 border border-blue-300"
          : preferredDate === "December 14"
            ? "bg-purple-100 text-purple-700 border border-purple-300"
            : "bg-gray-100 text-gray-700 border border-gray-300";

        return (
          <div className="flex items-center space-x-2">
            <Badge className={badgeColor}>
              {preferredDate || "Not specified"}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "island",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            Island
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const island = row.getValue("island") as string;
        return (
          <div>
            {island ? (
              <Badge className="bg-[#0f9dfe]/10 text-[#0f9dfe] border border-[#0f9dfe]/30">
                {island}
              </Badge>
            ) : (
              <span className="text-xs text-gray-500">Not specified</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "dietary_restrictions",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            Dietary Restrictions
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const dietaryRestrictions = row.original.dietary_restrictions as string;
        return (
          <div className="max-w-[200px]">
            {dietaryRestrictions ? truncateText(dietaryRestrictions, 30) : "None"}
          </div>
        );
      },
    },
    {
      accessorKey: "why_join",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            Why Join
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const whyJoin = row.original.why_join as string;
        return (
          <div className="min-w-[250px] whitespace-normal break-words">
            {whyJoin ? whyJoin : <span className="text-xs text-gray-500">Not provided</span>}
          </div>
        );
      },
    },
    {
      accessorKey: "has_attended_ga",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            Attended GA
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      filterFn: (row, _columnId, filterValue) => {
        const hasAttendedGa = row.original.has_attended_ga;
        const searchTerm = filterValue.toLowerCase().trim();

        if (searchTerm === "yes" || searchTerm === "y" || searchTerm === "true") {
          return hasAttendedGa === true;
        } else if (searchTerm === "no" || searchTerm === "n" || searchTerm === "false") {
          return hasAttendedGa === false;
        }

        return true;
      },
      cell: ({ row }) => {
        const hasAttendedGa = row.getValue("has_attended_ga") as boolean;
        return (
          <div className="flex items-center space-x-2">
            <Badge className={hasAttendedGa ? "bg-green-100 text-green-700 border border-green-300" : "bg-red-100 text-red-700 border border-red-300"}>
              {hasAttendedGa ? "Yes" : "No"}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "is_start_member",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            START Member
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      filterFn: (row, _columnId, filterValue) => {
        const isStartMember = row.original.is_start_member;
        const searchTerm = filterValue.toLowerCase().trim();

        if (searchTerm === "yes" || searchTerm === "y" || searchTerm === "true") {
          return isStartMember === true;
        } else if (searchTerm === "no" || searchTerm === "n" || searchTerm === "false") {
          return isStartMember === false;
        }

        return true;
      },
      cell: ({ row }) => {
        const isStartMember = row.getValue("is_start_member") as boolean;
        return (
          <div className="flex items-center space-x-2">
            <Badge className={isStartMember ? "bg-[#fcea3f]/20 text-[#fcea3f] border border-[#fcea3f]/50" : "bg-gray-100 text-gray-700 border border-gray-300"}>
              {isStartMember ? "Yes" : "No"}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      filterFn: (row, _columnId, filterValue) => {
        const status = row.original.status;
        const searchTerm = filterValue.toLowerCase().trim();

        return status.toLowerCase().includes(searchTerm);
      },
      cell: ({ row }) => {
        const status = row.getValue("status") as StatusType;

        return (
          <div className="flex items-center space-x-2">
            <Badge className={
              status === "accepted"
                ? "bg-green-100 text-green-700 border border-green-300"
                : status === "pending"
                  ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                  : status === "waitlisted"
                    ? "bg-purple-100 text-purple-700 border border-purple-300"
                    : status === "rejected"
                      ? "bg-red-100 text-red-700 border border-red-300"
                      : "bg-gray-100 text-gray-700 border border-gray-300"
            }>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "is_checked_in",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            Check-in
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      filterFn: (row, _columnId, filterValue) => {
        const isCheckedIn = row.original.is_checked_in;
        const searchTerm = filterValue.toLowerCase().trim();

        if (searchTerm === "yes" || searchTerm === "y" || searchTerm === "true" ||
          searchTerm === "checked in" || searchTerm === "checked" || searchTerm === "in") {
          return isCheckedIn === true;
        }
        else if (searchTerm === "no" || searchTerm === "n" || searchTerm === "false" ||
          searchTerm === "not checked in" || searchTerm === "not checked" || searchTerm === "out") {
          return isCheckedIn === false;
        }

        return true;
      },
      cell: ({ row }) => {
        const isCheckedIn = row.getValue("is_checked_in") as boolean;

        return (
          <div className="flex items-center space-x-2">
            <Badge className={isCheckedIn ? "bg-[#0f9dfe]/10 text-[#0f9dfe] border border-[#0f9dfe]/30" : "bg-red-100 text-red-700 border border-red-300"}>
              {isCheckedIn ? "Checked In" : "Not Checked In"}
            </Badge>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      enableHiding: false,
      cell: ({ row }) => {
        const registrant = row.original;

        return (
          <ActionCell
            registrant={registrant}
            isUpdating={isUpdating}
            toggleCheckIn={toggleCheckIn}
            updateRegistrantStatus={updateRegistrantStatus}
            deleteRegistrant={deleteRegistrant}
            onDataChange={onDataChange}
          />
        );
      },
    },
  ];
}
