import { useState } from "react";
import Popup from "components/popup";
import Button from "components/button";
import { useMutation, useQuery } from "urql";

const UPDATE_USER_MUTATION = `
  mutation UpdateUser($username: String!, $userId: Int!) {
    update_users_by_pk(_set: {username: $username}, pk_columns: {id: $userId}) {
      username
      id
    }
  }
`;

const USER_QUERY = `
query UserQuery($userId: Int!) {
    users_by_pk(id: $userId) {
      username
    }
  }`;

const ChooseUsername = ({ currentUser }) => {
  const [updateUserResult, updateUser] = useMutation(UPDATE_USER_MUTATION);
  const [{ data, fetching, error }, reexecuteQuery] = useQuery({
    query: USER_QUERY,
    variables: { userId: currentUser?.id },
  });
  const [inputValue, setInputValue] = useState("");

  if (data && data.users_by_pk.username) return null;
  if (!currentUser) return null;
  if (fetching) return null;
  return (
    <Popup>
      <h1 className="font-chicago mb-1 leading-4">
        Welcome to Mockintosh Computer Club!
      </h1>
      <p className="mb-2">Pick a username</p>
      <input
        spellCheck="false"
        autoFocus
        className="focus:outline-none px-2 font-geneva placeholder-black border border-black mb-2 p-0.5"
        placeholder=""
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      <Button
        onClick={() => {
          updateUser({
            username: inputValue,
            userId: currentUser.id.toString(),
          });
        }}
      >
        Submit
      </Button>
    </Popup>
  );
};

export default ChooseUsername;
