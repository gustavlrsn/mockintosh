import { useState } from "react";
import { useQuery, useMutation, useSubscription } from "urql";
import autoscroll from "autoscroll-react";
import Button from "components/button";

const CHAT_MESSAGES_QUERY = `query ChatMessages {
  chat_messages {
    id
    message
    created_at
    user {
      username
    }
  }
}
`;

const CHAT_MESSAGES_SUBSCRIPTION = `subscription ChatMessages {
  chat_messages {
    id
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
    id
    message
    created_at
    user {
      username
    }
  }
}
`;

const ChatInput = ({ currentUser }) => {
  const [res, insertChatMessage] = useMutation(INSERT_CHAT_MESSAGE_MUTATION);
  const [messageField, setMessageField] = useState("");

  const exp = /[^\u0000-\u024F\u1E00-\u1EFF\u2C60-\u2C7F\uA720-\uA7FF]/g;

  return (
    <div className="flex items-center border-t border-black py-1">
      {currentUser ? (
        <input
          spellCheck="false"
          autoFocus
          className="focus:outline-none px-1 mx-1 font-geneva w-full placeholder-black"
          placeholder="Write a message..."
          value={messageField}
          onChange={(e) => setMessageField(e.target.value.replace(exp, ""))}
        />
      ) : (
        <div className="font-geneva px-2 w-full">Log in to post messages</div>
      )}
      <Button
        type="submit"
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
  );
};

class ChatMessages extends React.Component {
  render() {
    const { messages = [], ...props } = this.props;

    return (
      <ul className="px-2 py-1 h-48 overflow-y-scroll scroll" {...props}>
        {messages.map((message) => (
          <div className="font-geneva" key={message.id}>
            <span className="font-geneva">{message.user.username}</span>:{" "}
            {message.message}
          </div>
        ))}
      </ul>
    );
  }
}

const AutoScrollChat = autoscroll(ChatMessages);

const Chat = ({ currentUser }) => {
  const [{ data, fetching, error }, executeQuery] = useQuery({
    query: CHAT_MESSAGES_QUERY,
  });

  // const [subscriptionRes] = useSubscription(
  //   { query: CHAT_MESSAGES_SUBSCRIPTION },
  //   (messages = [], response) => {
  //     return [response.chat_messages, ...messages];
  //   }
  // );

  // console.log({ subscriptionRes });

  return (
    <div>
      <AutoScrollChat
        messages={data?.chat_messages}
        // onScrolledTop={() => console.log("fetch more items")}
        // onScrolled={() => console.log("the list was scrolled")}
      />
      <ChatInput currentUser={currentUser} />
    </div>
  );
};

export default Chat;
