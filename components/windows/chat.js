import { useState } from "react";
import { useQuery, useMutation } from "urql";

import Button from "components/button";

const chatQuery = `query ChatMessages {
  chat_messages {
    message
    created_at
    user {
      username
    }
  }
}
`;

const INSERT_CHAT_MESSAGE_MUTATION = `mutation InsertChatMessage ($message: String!) {
  insert_chat_messages_one(object: {message: $message}) {
    message
    created_at
    user {
      username
    }
  }
}
`;

const Chat = ({ currentUser }) => {
  const [messageField, setMessageField] = useState("");

  const [{ data, fetching, error }, executeQuery] = useQuery({
    query: chatQuery,
  });

  const [res, insertChatMessage] = useMutation(INSERT_CHAT_MESSAGE_MUTATION);

  return (
    <div>
      <div className="">
        <div className="px-2 py-1 h-48 overflow-y-scroll scroll">
          {data?.chat_messages.map((message, i) => (
            <div className="font-geneva" key={i}>
              <span className="font-geneva">{message.user.username}</span>:{" "}
              {message.message}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center border-t border-black py-1">
        {currentUser ? (
          <input
            spellCheck="false"
            autoFocus
            className="focus:outline-none px-1 mx-1 font-geneva w-full placeholder-black"
            placeholder="Write a message..."
            value={messageField}
            onChange={(e) => setMessageField(e.target.value)}
          />
        ) : (
          <div className="font-geneva px-2 w-full">Log in to post messages</div>
        )}
        <Button
          disabled={!currentUser}
          className="mr-1"
          onClick={() => {
            insertChatMessage({ message: messageField }).then((data) =>
              console.log({ data })
            );

            setMessageField("");
          }}
        >
          Send
        </Button>
      </div>
    </div>
  );
};

export default Chat;
