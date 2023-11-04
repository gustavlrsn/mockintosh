import pkg from "../../package.json";
import { Window } from "../ui/window";
const version = pkg.version;
// todo: fetch this from github api
const contributors = [{ username: "gustavlrsn", commits: 74 }];

export default function AboutWindow({ window, i }) {
  return (
    <Window {...window} i={i} width={343}>
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
              <li
                key={contributor.username}
                className="flex justify-between mt-1"
              >
                <div className="flex items-center">
                  <img
                    src="/user2.png"
                    className="mr-2"
                    style={{
                      height: 15,
                      width: 12,
                    }}
                  />
                  <span>@{contributor.username}</span>
                </div>{" "}
                <span>{contributor.commits} commits</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Window>
  );
}
