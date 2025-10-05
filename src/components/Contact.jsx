import { useState } from "react";
import AnimatedTitle from "./AnimatedTitle";
import Button from "./Button";
import EmergencyScenarioVisualizer from "./EmergencyScenarioVisualizer";

const ImageClipBox = ({ src, clipClass }) => (
  <div className={clipClass}>
    <img src={src} alt="contact visual" />
  </div>
);

const Contact = () => {
  const [showVisualizer, setShowVisualizer] = useState(false);

  return (
    <div id="contact" className="my-20 min-h-96 w-screen px-10">
      <div className="relative rounded-lg bg-black py-24 text-blue-50 sm:overflow-hidden">
        {/* Left Images */}
        <div className="absolute -left-20 top-0 hidden h-full w-72 overflow-hidden sm:block lg:left-20 lg:w-96">
          <ImageClipBox
            src="/img/contacts-1.webp"
            clipClass="contact-clip-path-1"
          />
          <ImageClipBox
            src="/img/contact-2.webp"
            clipClass="contact-clip-path-2 lg:translate-y-40 translate-y-60"
          />
        </div>

        {/* Right Images */}
        <div className="absolute -top-40 left-20 w-60 sm:top-1/2 md:left-auto md:right-10 lg:top-20 lg:w-80">
          <ImageClipBox
            src="/img/contacts.jpg"
            clipClass="absolute md:scale-125"
          />
          <ImageClipBox
            src="/img/contacts.jpg"
            clipClass="sword-man-clip-path md:scale-125"
          />
        </div>

        {/* Center Content */}
        <div className="flex flex-col items-center text-center">
          <p className="mb-10 font-general text-[10px] uppercase">
            Join COSMIC PODS
          </p>

          <AnimatedTitle
            title={`your <b>HOME</b><b></b><br />BEyond:<br />where life<br />meets the<br /><b>cosmos</b>.`}
            className="special-font !md:text-[6.2rem] w-full font-zentry !text-5xl !font-black !leading-[.9]"
          />

          {/* Contact Us button that opens EmergencyScenarioVisualizer */}
          <Button
            title="EmergencyScenarioVisualizer"
            containerClass="mt-10 cursor-pointer bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
            onClick={() => setShowVisualizer(true)}
          />
        </div>
      </div>
      {showVisualizer && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-start justify-center z-[999] overflow-y-auto">
          <div className="relative bg-white rounded-2xl shadow-lg p-6 mt-20 w-[95%] max-w-lg sm:max-w-3xl lg:max-w-5xl">
            
            {/* Close button with red circle */}
            <button
              onClick={() => setShowVisualizer(false)}
              className="absolute top-3 right-3 flex items-center justify-center w-6 h-6 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-md transition-colors"
            >
              ✕
            </button>

            <EmergencyScenarioVisualizer />

            {/* Extra spacing for small devices */}
            <div className="mt-6 flex justify-center sm:hidden">
              <Button onClick={() => setShowVisualizer(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contact;


