import { Icon } from '@iconify/react';

export default function Topbar() {
  return (
    <header className="h-14 bg-slate-900 flex items-center px-4 justify-between md:hidden shadow-sm">
      <div className="flex items-center text-white">
        <button className="mr-3">
          <Icon icon="mdi:menu" className="text-2xl" />
        </button>
        <h1 className="font-bold text-lg">EPI Grafomoto</h1>
      </div>
      
      <div className="flex items-center text-white">
        <Icon icon="mdi:account-circle" className="text-2xl" />
      </div>
    </header>
  );
}
