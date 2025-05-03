export default function VideoPanels({ localRef, remoteRef }) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <video ref={localRef} autoPlay muted className="w-72 h-48 bg-black rounded-lg" />
      <video ref={remoteRef} autoPlay className="w-72 h-48 bg-black rounded-lg" />
    </div>
  );
}
