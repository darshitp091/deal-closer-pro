
import { Quote, Play } from "lucide-react";

const Testimonial = () => {
  return (
    
    <section
      id="testimonials"
      className="relative overflow-hidden bg-black-600 py-24 sm:py-28"
    >
      {/* Background blue glow */}
      <div className="absolute left-1/2 top-[-150px] h-[550px] w-[800px] -translate-x-1/2 rounded-full bg-black-600/20 blur-[150px]" />

      <div className="absolute bottom-[-200px] left-[-150px] h-[450px] w-[450px] rounded-full bg-cyan-500/10 blur-[130px]" />

      <div className="absolute right-[-150px] top-[30%] h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-[130px]" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">

        {/* Heading */}
        <div className="mx-auto mb-14 max-w-3xl text-center">

          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]" />

            <span className="text-sm font-medium text-blue-200">
              Client Testimonials
            </span>
          </div>

          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Real People.
            <br />

            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
              Real Results.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            See what our clients have to say about their experience
            working with Ishwari Socials.
          </p>
        </div>

        {/* Testimonials */}
        <div className="grid gap-6 lg:grid-cols-[1.5fr_0.8fr]">

          {/* VIDEO TESTIMONIAL */}
          <div
            className="
              group overflow-hidden rounded-[28px]
              border border-blue-500/20
              bg-white/[0.035]
              shadow-[0_20px_80px_rgba(0,60,180,0.15)]
              backdrop-blur-xl
              transition-all duration-500
              hover:border-blue-400/40
              hover:shadow-[0_25px_100px_rgba(0,90,255,0.22)]
            "
          >

            {/* Video */}
            <div className="relative flex min-h-[300px] items-center justify-center bg-[#000814] sm:min-h-[450px]">

              <video
                className="max-h-[650px] w-full object-contain"
                controls
                playsInline
                preload="metadata"
              >
                <source
                  src="/testimonial.mp4"
                  type="video/mp4"
                />

                Your browser does not support the video tag.
              </video>

              {/* Video label */}
              <div className="pointer-events-none absolute left-5 top-5 flex items-center gap-2 rounded-full border border-blue-400/20 bg-[#020617]/80 px-3 py-2 shadow-lg backdrop-blur-md">
                <Play className="h-3.5 w-3.5 fill-blue-400 text-blue-400" />

                <span className="text-xs font-medium text-blue-100">
                  Video Testimonial
                </span>
              </div>
            </div>

            {/* Testimonial text */}
            <div className="p-7 sm:p-9">

              <Quote className="mb-5 h-8 w-8 text-blue-400" />

              <p className="max-w-3xl text-xl font-medium leading-8 text-white sm:text-2xl">
                “Ishwari Socials helped us connect with the right
                opportunities and made the entire deal process much easier.”
              </p>

              {/* Client */}
              <div className="mt-7 flex items-center gap-4">

                <div
                  className="
                    flex h-11 w-11 items-center justify-center
                    rounded-full
                    bg-gradient-to-br from-blue-500 to-cyan-400
                    text-sm font-bold text-white
                    shadow-[0_0_20px_rgba(37,99,235,0.35)]
                  "
                >
                  C
                </div>

                <div>
                  <p className="font-semibold text-white">
                    Our Client
                  </p>

                  <p className="text-sm text-slate-500">
                    Business Owner
                  </p>
                </div>

              </div>
            </div>
          </div>

          {/* SCREENSHOT TESTIMONIAL */}
          <div
            className="
              overflow-hidden rounded-[28px]
              border border-blue-500/20
              bg-white/[0.035]
              shadow-[0_20px_80px_rgba(0,60,180,0.15)]
              backdrop-blur-xl
              transition-all duration-500
              hover:border-blue-400/40
              hover:shadow-[0_25px_100px_rgba(0,90,255,0.22)]
            "
          >

            <div className="p-7 sm:p-8">

              {/* Header */}
              <div className="mb-6 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-blue-400/20 bg-blue-500/10">
                  <Quote className="h-5 w-5 text-blue-400" />
                </div>

                <div>
                  <p className="font-semibold text-white">
                    Client Feedback
                  </p>

                  <p className="text-sm text-slate-500">
                    A message from our client
                  </p>
                </div>

              </div>

              {/* Screenshot */}
              <div className="overflow-hidden rounded-2xl border border-blue-500/10 bg-[#000814]">
                <img
                  src="/testimonial-screenshot.jpeg"
                  alt="Client testimonial screenshot"
                  className="h-auto w-full object-contain"
                />
              </div>

              <p className="mt-6 text-sm leading-6 text-slate-500">
                Genuine feedback from a client who experienced
                Ishwari Socials firsthand.
              </p>

            </div>
          </div>

        </div>

        {/* Bottom statement */}
        <div className="mt-12 text-center">

          <div className="mx-auto mb-4 h-px w-24 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

          <p className="text-sm text-slate-500">
            Trusted by businesses looking to turn opportunities
            into closed deals.
          </p>

        </div>

      </div>
    </section>
  );
};

export default Testimonial;

