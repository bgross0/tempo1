'use client';

export default function MinimalTestPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">Minimal Tailwind Test</h1>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-red-100 p-4 rounded-lg">
          <p className="text-red-800">This should have a red background and text</p>
        </div>
        <div className="bg-blue-100 p-4 rounded-lg">
          <p className="text-blue-800">This should have a blue background and text</p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg">
          <p className="text-green-800">This should have a green background and text</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg">
          <p className="text-yellow-800">This should have a yellow background and text</p>
        </div>
      </div>
      <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
        Test Button
      </button>
    </div>
  );
}
