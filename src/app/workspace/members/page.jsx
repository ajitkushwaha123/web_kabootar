"use client";

import React, { useEffect, useState } from "react";
import PageHeader from "@/components/global/PageHeader/page";
import DataTable from "@/components/global/table/DataTable";
import { Badge } from "@/components/ui/badge";
import { useWorkspace } from "@/hooks/useWorkspace";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import InviteWorkspaceMember from "@/components/global/workspace/InviteWorkspaceMember";

const columns = [
  {
    header: "Avatar",
    accessor: "profileImageUrl",
    className: "w-[60px]",
    render: (row) => (
      <Avatar className="h-8 w-8">
        <AvatarImage src={row.profileImageUrl} alt={row.name} />
        <AvatarFallback>{row.name?.[0]}</AvatarFallback>
      </Avatar>
    ),
  },
  {
    header: "Name",
    accessor: "name",
    className: "w-1/4",
  },
  {
    header: "Username",
    accessor: "username",
    className: "w-1/4",
  },
  {
    header: "Email",
    accessor: "email",
    className: "w-1/4",
  },
  {
    header: "Phone",
    accessor: "phoneNumber",
    className: "w-1/4",
    render: (row) => row.phoneNumber || <span className="text-muted">—</span>,
  },
  {
    header: "Active",
    accessor: "isActive",
    className: "w-1/6",
    render: (row) =>
      row.isActive ? (
        <Badge variant="default">Active</Badge>
      ) : (
        <Badge variant="outline">Inactive</Badge>
      ),
  },
  {
    header: "Role",
    accessor: "role",
    className: "w-1/6",
    render: (row) => (
      <Badge variant={row.role === "admin" ? "default" : "outline"}>
        {row.role}
      </Badge>
    ),
  },
];

const Page = () => {
  const {
    members,
    fetchMembersOfCurrentWorkspace,
    currentWorkspace,
    membersError,
    membersLoading,
  } = useWorkspace();

  useEffect(() => {
    if (currentWorkspace?._id) {
      fetchMembersOfCurrentWorkspace(currentWorkspace._id);
    }
  }, [currentWorkspace]);

  console.log("Members Data:", members);

  const [open, setOpen] = useState(false);

  console.log("Invite form open state:", open);

  const renderInviteForm = (state) => {
    console.log("Show invite form");
    setOpen(state); 
  };

  return (
    <div className="p-6">
      <PageHeader
        title="Members"
        description="Manage your workspace members and roles."
        filterOptions={["All", "Admins", "Editors", "Viewers"]}
        onFilterChange={(value) => console.log("Filter changed to:", value)}
        defaultFilter="All"
        buttonText="Add Member"
        clickBtn={true}
        showButton={true}
        showFilter={true}
        onOpenChange={(isOpen) => renderInviteForm(isOpen)}
      />

      <div className="mt-6">
        {membersLoading ? (
          <div className="text-center text-gray-500">Loading members...</div>
        ) : membersError ? (
          <div className="text-red-500 text-center">
            Error fetching members: {membersError}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={members || []}
            rowKey={(row) => row._id}
          />
        )}
      </div>

      <InviteWorkspaceMember
        open={open}
        onOpenChange={setOpen}
      />

      
    </div>
  );
};

export default Page;
