import { Link, useLocation } from "react-router";
import { useState, useEffect } from "react";

export default function Navbar({ showModal, setShowModal }) {
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    const navLinks = [
        { to: "/", label: "Home", icon: HomeIcon },
        { to: "/total-gaji", label: "Total Gaji", icon: WalletIcon },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav
            className={`sticky top-0 z-50 transition-all px-4 duration-500 ${
                scrolled
                    ? "bg-neutral-950/80 backdrop-blur-xl shadow-lg shadow-black/20 border-b border-neutral-800/50"
                    : "bg-neutral-950/40 backdrop-blur-md border-b border-transparent"
            }`}
        >
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between h-16">
                    {/* Logo / Brand */}
                    <Link to="/" className="flex items-center gap-3 group">
                        {/* Gradient Icon */}
                        <div className="relative">
                            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow duration-300">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="w-5 h-5 text-white"
                                >
                                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                                    <path d="M3 6h18" />
                                    <path d="M16 10a4 4 0 0 1-8 0" />
                                </svg>
                            </div>
                            {/* Subtle glow */}
                            <div className="absolute inset-0 w-9 h-9 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-base font-bold bg-linear-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent tracking-tight leading-tight">
                                Catatan Setoran
                            </span>
                            <span className="text-[10px] text-neutral-500 font-medium tracking-widest uppercase leading-tight">
                                Bag Tracker
                            </span>
                        </div>
                    </Link>

                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                                    isActive(link.to)
                                        ? "text-white bg-neutral-800/60"
                                        : "text-neutral-400 hover:text-white hover:bg-neutral-800/30"
                                }`}
                            >
                                <link.icon
                                    active={isActive(link.to)}
                                    className="w-4 h-4"
                                />
                                {link.label}
                                {isActive(link.to) && (
                                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-linear-to-r from-indigo-500 to-purple-500" />
                                )}
                            </Link>
                        ))}
                        {isActive('/') && (
                            <button
                                onClick={() => setShowModal(true)}
                                className="ml-2 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white transition-all duration-300 shadow-lg shadow-indigo-500/20"
                            >
                                <PlusIcon className="w-4 h-4" />
                                Tambah
                            </button>
                        )}
                    </div>

                    {/* Mobile: Tambah + Hamburger */}
                    <div className="md:hidden flex items-center gap-2">
                        {isActive('/') && (
                            <button
                                onClick={() => {
                                    setShowModal(true)
                                    setMobileOpen(false)
                                }}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white transition-all duration-300 shadow-lg shadow-indigo-500/20"
                            >
                                <PlusIcon className="w-4 h-4" />
                                Tambah
                            </button>
                        )}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="relative w-10 h-10 flex items-center justify-center rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800/50 transition-all duration-300"
                            aria-label="Toggle menu"
                        >
                            <div className="w-5 h-4 flex flex-col justify-between">
                                <span
                                    className={`block h-0.5 w-full bg-current rounded-full transition-all duration-300 origin-center ${
                                        mobileOpen
                                            ? "rotate-45 translate-y-[7px]"
                                            : ""
                                    }`}
                                />
                                <span
                                    className={`block h-0.5 w-full bg-current rounded-full transition-all duration-300 ${
                                        mobileOpen ? "opacity-0 scale-x-0" : ""
                                    }`}
                                />
                                <span
                                    className={`block h-0.5 w-full bg-current rounded-full transition-all duration-300 origin-center ${
                                        mobileOpen
                                            ? "-rotate-45 translate-y-[-7px]"
                                            : ""
                                    }`}
                                />
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div
                className={`md:hidden overflow-hidden transition-all duration-400 ease-out ${
                    mobileOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
                }`}
            >
                <div className="pb-4 pt-1 space-y-1 border-t border-neutral-800/50">
                    {navLinks.map((link) => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                                isActive(link.to)
                                    ? "text-white bg-neutral-800/60"
                                    : "text-neutral-400 hover:text-white hover:bg-neutral-800/30"
                            }`}
                        >
                            <link.icon
                                active={isActive(link.to)}
                                className="w-4 h-4"
                            />
                            {link.label}
                            {isActive(link.to) && (
                                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-linear-to-r from-indigo-500 to-purple-500" />
                            )}
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    );
}

// ─── Icon Components ────────────────────────────────────────

function HomeIcon({ active, className }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={active ? 2.5 : 2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    );
}

function WalletIcon({ active, className }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={active ? 2.5 : 2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
            <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
        </svg>
    );
}

function PlusIcon({ className }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
        </svg>
    );
}