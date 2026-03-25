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
  metadata,
  onCorrect,
}) => {
  return (
    <div>
      <MessageLayout
        name={name}
        avatar={avatar}
        time={time}
        status={status}
        direction={direction}
        metadata={metadata}
        onCorrect={(txt, trigger) => onCorrect?.(message, trigger)}
      >
        <p className="text-sm py-2">{message}</p>
      </MessageLayout>
    </div>
  );
};
