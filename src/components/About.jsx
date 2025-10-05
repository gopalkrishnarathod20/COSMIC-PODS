import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";

import AnimatedTitle from "./AnimatedTitle";

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  useGSAP(() => {
    const clipAnimation = gsap.timeline({
      scrollTrigger: {
        trigger: "#clip",
        start: "center center",
        end: "+=800 center",
        scrub: 0.5,
        pin: true,
        pinSpacing: true,
      },
    });

    clipAnimation.to(".mask-clip-path", {
      width: "100vw",
      height: "100vh",
      borderRadius: 0,
    });
  });

  return (
    <div id="about" className="min-h-screen w-screen">
      <div className="relative mb-8 mt-36 flex flex-col items-center gap-5">
        <p className="font-general text-sm uppercase md:text-[10px]">
          Welcome to COSMIC PODS
        </p>

        <AnimatedTitle
          title="Step Into <b></b>Humanity's <br /> Biggest<b></br><b>Adventure</br>Yet"
          containerClass="mt-5 !text-white text-center"
        />

        <div className="about-subtext">
          <p>
            Cosmic Pods is a visionary world where you can design your own way of living
            crafting experiences, shaping environments, and defining your
            purpose in a universe without limits.
          </p>
          <p className="text-gray-400 ">
             It marks the beginning of an
            epic new era, where individuality meets interconnectedness. Every
            pod becomes a personal cosmos, linking countless games, worlds, and
            realities — both digital and physical — into a unified Play Economy
            that celebrates creativity, collaboration, and evolution. Here, life
            isn’t just lived it’s designed, shared, and constantly reborn.
          </p>
        </div>
      </div>

      <div className="h-dvh w-screen" id="clip">
        <div className="mask-clip-path about-image">
          <img
            src="img/about.png"
            alt="Background"
            className="absolute left-0 top-0 size-2% object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default About;
