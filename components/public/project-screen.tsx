// Pantalla de un proyecto: captura real (`screenshot`) o ilustración sin texto según `visual`.
// Ambos campos salen de content/projects/projects.json.
import Image from "next/image";

export function ProjectScreen({
  visual,
  screenshot = "",
  alt = "",
}: {
  visual: string;
  screenshot?: string;
  alt?: string;
}) {
  // Con captura real (public/uploads) se muestra la imagen; si no, la pantalla ilustrativa.
  if (screenshot) {
    return (
      <div className="scr scr-shot">
        <Image src={screenshot} alt={alt} fill sizes="(max-width: 850px) 100vw, 560px" />
      </div>
    );
  }
  switch (visual) {
    case "matches":
      return (
        <div className="scr scr-matches" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <div className="scr-row" key={i}>
              <i />
              <b />
              <i />
            </div>
          ))}
        </div>
      );
    case "tours":
      return (
        <div className="scr scr-tours" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div className="scr-tour" key={i}>
              <i />
              <span />
              <span />
            </div>
          ))}
        </div>
      );
    case "arch":
      return (
        <div className="scr scr-arch" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
      );
    case "idea":
      return (
        <div className="scr scr-idea" aria-hidden="true">
          <span />
        </div>
      );
    default:
      return (
        <div className="scr scr-plain" aria-hidden="true">
          <i />
          <i />
          <i />
          <div>
            <b />
            <b />
            <b />
          </div>
        </div>
      );
  }
}
