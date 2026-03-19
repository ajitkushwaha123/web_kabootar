"use client";

import * as React from "react";
import { MessageLayout } from "../layout";

export const TextMessage = ({
  name,
  avatar,
  time,
  message,
  status,
  direction = "incoming",
}) => {
  return (
    <div>
      <MessageLayout
        name={name}
        avatar={avatar}
        time={time}
        status={status}
        direction={direction}
      >
        <p className="text-sm py-2">{message}</p>
      </MessageLayout>
    </div>
  );
};
