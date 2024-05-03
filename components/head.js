import NextHead from "next/head";

export default function Head() {
  return (
    <NextHead>
      <title>Mockintosh</title>
      <meta property="og:image" content="https://mockintosh.com/og.png" />
      <meta property="og:title" content="Mockintosh" />
      <meta property="og:description" content="mock operating system" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://mockintosh.com/" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:creator" content="@gustavlrsn" />
      <meta name="twitter:title" content="Mockintosh" />
      <meta name="twitter:description" content="mock operating system" />
      <meta name="twitter:image" content="https://mockintosh.com/og.png" />
    </NextHead>
  );
}
