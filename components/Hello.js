import Window from "./Window";

export default ({ close }) => {
  return (
    <Window title="Welcome" close={close}>
      <div className="p-5 arial">
        <p className="mb-3">
          Hey. Welcome to Pluto Computer Club. This is some kind of
          collaborative open source art experiment.
        </p>
        <p className="mb-3">
          The idea and esthetics is very inspired by the awesome{" "}
          <a className="underline" href="https://poolside.fm" target="_blank">
            Poolside.fm
          </a>
          , but here you are invited to help build the experience further on{" "}
          <a
            className="underline"
            href="https://github.com/plutocomputerclub/plutocomputerclub"
            target="_blank"
          >
            GitHub
          </a>
          .
        </p>
        <p className="mb-3">
          It's built in React so if you are familiar with that you will be able
          to be up and running very quickly.
        </p>

        <a href="https://twitter.com/gustavlrsn" className="font-semibold">
          @gustavlrsn
        </a>
      </div>
    </Window>
  );
};
