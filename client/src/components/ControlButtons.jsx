export default function ControlButtons({ onStart, onNext, onStop }) {
  return (
    <div className="flex gap-4 mt-4">
      <button onClick={onStart} className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-xl">Start</button>
      <button onClick={onNext} className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 rounded-xl">Next</button>
      <button onClick={onStop} className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-xl">Stop</button>
    </div>
  );
}
