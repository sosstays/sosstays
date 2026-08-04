"use client";

import Script from "next/script";

type Props = {
  url: string;
  identifier: string;
  title: string;
};

const SHORTNAME = process.env.NEXT_PUBLIC_DISQUS_SHORTNAME || "sosstays";

// Loads the Disqus embed for a single blog post. `identifier` and `url` are
// passed via disqus_config so Disqus can match the thread across page loads.
export function DisqusComments({ url, identifier, title }: Props) {
  return (
    <div className="mt-14 border-t border-sage-grey/30 pt-10">
      <div id="disqus_thread" />
      <Script
        id="disqus-config"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            var disqus_config = function () {
              this.page.url = ${JSON.stringify(url)};
              this.page.identifier = ${JSON.stringify(identifier)};
              this.page.title = ${JSON.stringify(title)};
            };
          `,
        }}
      />
      <Script
        id="disqus-embed"
        src={`https://${SHORTNAME}.disqus.com/embed.js`}
        strategy="afterInteractive"
      />
      <noscript>
        Please enable JavaScript to view the{" "}
        <a href="https://disqus.com/?ref_noscript">comments powered by Disqus.</a>
      </noscript>
    </div>
  );
}
