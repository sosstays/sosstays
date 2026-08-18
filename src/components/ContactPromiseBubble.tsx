// Reassurance bubble overlaid on the bottom-right corner of the contact
// photo (see the absolutely-positioned wrapper around it in
// app/contact/page.tsx). Sizes off its parent instead of a fixed pixel
// width so it holds up at any screen size. Pops in shortly after load (see
// .sos-bubble-pop in globals.css) like a message arriving in a chat. The
// tail is the classic CSS border-triangle trick (see .sos-speech-bubble in
// globals.css).
export function ContactPromiseBubble() {
  return (
    <div className="sos-bubble-pop sos-speech-bubble flex w-full items-center gap-1.5 border border-sage-grey/40 bg-cream p-5 shadow-[0_12px_30px_rgba(23,25,23,0.12)] sm:gap-2 sm:p-6">
      <p className="text-sm leading-relaxed text-near-black sm:text-[15px]">
        Send it over — we&apos;ll get back to you as soon as we can. And that&apos;s a guarantee.
      </p>
      {/* Same swirl mark as app/icon.svg, beside the message. */}
      <svg viewBox="0 0 387.54 398.11" aria-hidden="true" className="h-14 w-14 flex-none text-light-sage sm:h-20 sm:w-20">
        <path
          fill="currentColor"
          d="M386.76,167.88c-2.16,8-18.83,35.14-30.73,55.08-18.97,31.26-37.14,68.33-67.63,89.83C167.69,398.46,6.38,218.54,54.66,110.5c16.35-41.14,64.98-58.47,103.38-69.71,16.88-5.22,28.6-9.5,30.29-13.48,1.25-8.52-23.18-7.54-44.59-3.85-19.16,3.57-41.52,11.74-61.01,24.9-173.99,120.59,44.67,389.68,200.71,298.96,13.23-7.26,31.72-21.87,41.19-27.9,16.3-10.91,3.8,11.67-.43,18.04-38.29,66.02-107,72.55-174.93,46.21C-40.79,322.07-64.41-16.44,166.41.62c38.45,4.34,76.55,18.52,107.83,41.38,42.27,30.69,78.88,75.44,61.57,127.72-12.83,37.13-51.59,96.72-90.28,113.46-41.51,17.31-88.83-8.56-117.2-41.22-36.22-38.21-46.84-107.55-5.6-143.01,33.08-31.31,95.79-19.78,117.27,21.54,20.72,32.31-.97,85.76-43.36,70.14-11.54-4.74-19.21-14.64-22.62-25.14-1.12-2.86-4.14-15.93,1.03-11.25,3.93,3.84,12.19,19.64,24.2,21.37,22.25,2.82,39.08-20.56,28.9-41.46-27.34-56.09-107.72-42.83-114.36,20.36-6.84,52.15,42.46,102.43,93.47,107.89,59.84,8.41,105.43-52.18,103.49-109.6.85-40.67-30.98-88.78-63.5-103.75-7.72-2.1,11.13,21.21,14.22,26.71,5.82,8.63,12.35,18.75,16.95,28.7,24.41,49.72-.17,128.36-61.32,132.3-50.88,6.05-110.51-58.91-72.97-103.91,16.23-18.68,55.02-28.43,70.72-5.84,3.44,4.98,8.56,16.11,1.68,18.25-23.87.78-56.3-31.26-71.46,7.5-6.25,20.05,4.29,43.72,20.36,56.46,27.74,22.48,68.02,5.98,87.8-19.97C343.22,65.96,75.29,9.42,72.27,148.72c-2.98,74.62,67.85,169.93,144.31,171.29,75.41-2.9,113.51-115.61,159.42-152.11,5.26-4.15,14.06-10.98,10.85-.29l-.09.27Z"
        />
      </svg>
    </div>
  );
}
