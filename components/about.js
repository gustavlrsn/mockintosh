import { version } from "../package.json";

// todo: fetch this from github api
const contributors = [{ username: "gustavlrsn", commits: 259 }];

export default () => {
  return (
    <div className="font-geneva pt-2">
      <div className="px-4 grid grid-cols-2 gap-2">
        <div className="flex items-end">
          <img src="/icons/computer.png" className="mr-1" />
          <span>Mockintosh Classic</span>
        </div>
        <div className="">
          <div>System Version {version}</div>
        </div>
        <div>Contributors</div>
      </div>

      <div
        className="border-t scroll border-black overflow-y-scroll h-20"
        style={{ resize: "vertical", minHeight: "60px" }}
      >
        <ul className="px-4">
          {contributors.map((contributor) => (
            <li key={contributor.username} className="flex justify-between">
              <span>@{contributor.username}</span>{" "}
              <span>{contributor.commits} commits</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
