import { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Server, FileText, Database, Shield, Lock, Terminal, Activity, ArrowRight, BookOpen } from 'lucide-react';

// Dynamically import all markdown files from the new modular structure
const rootMd = import.meta.glob('../README.md', { as: 'raw', eager: true });
const contentMd = import.meta.glob('../content/**/*.md', { as: 'raw', eager: true });
const mdModules = { ...rootMd, ...contentMd };

function parseFilename(path) {
    const file = path.split('/').pop().replace('.md', '');
    // Format "01_Initial_Enumeration" -> "01 - Initial Enumeration"
    if (file === 'README' || file.toLowerCase() === 'service_interaction_matrix') {
        return file.replace(/_/g, ' ').toUpperCase();
    }
    return file.replace(/^(\d{2})_/, '$1 - ').replace(/_/g, ' ');
}

// Map filenames to lucide icons
function getIconForFile(filename) {
    const name = filename.toLowerCase();
    if (name.includes('network') || name.includes('lateral')) return <Network size={18} className="nav-icon" />;
    if (name.includes('web')) return <Activity size={18} className="nav-icon" />;
    if (name.includes('auth') || name.includes('credential')) return <Lock size={18} className="nav-icon" />;
    if (name.includes('privilege')) return <Shield size={18} className="nav-icon" />;
    if (name.includes('database') || name.includes('mysql') || name.includes('redis') || name.includes('mongodb')) return <Database size={18} className="nav-icon" />;
    if (name.includes('ssh') || name.includes('ftp') || name.includes('smb')) return <Server size={18} className="nav-icon" />;
    if (name.includes('shell') || name.includes('exploitation') || name.includes('interaction')) return <Terminal size={18} className="nav-icon" />;
    if (name.includes('readme')) return <BookOpen size={18} className="nav-icon" />;
    return <FileText size={18} className="nav-icon" />;
}

export default function App() {
    // Parse all loaded markdown files into a structured array
    const files = useMemo(() => {
        return Object.keys(mdModules).map(path => {
            const content = mdModules[path];
            const name = parseFilename(path);
            return { path, name, content };
        }).sort((a, b) => {
            // Keep README at the top
            if (a.name === 'README') return -1;
            if (b.name === 'README') return 1;
            return a.name.localeCompare(b.name);
        });
    }, []);

    const [activeFile, setActiveFile] = useState(files.find(f => f.name === 'README') || files[0]);

    // Handle internal markdown links (e.g., [FTP Enumeration](03_FTP_Enumeration.md))
    // We rewrite clicking a link to route internally if it matches a file.
    const handleLinkClick = (e, href) => {
        if (href && href.endsWith('.md')) {
            const targetPath = `../${href}`;
            const targetFile = files.find(f => f.path === targetPath);
            if (targetFile) {
                e.preventDefault();
                setActiveFile(targetFile);
            }
        }
    };

    return (
        <div className="app-container">
            {/* Sidebar Navigation */}
            <motion.nav
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="sidebar"
            >
                <div className="sidebar-header">
                    <Terminal className="logo-icon" size={28} />
                    <h2>M.O.M / WebApp</h2>
                </div>

                <ul className="nav-list">
                    {files.map((file) => (
                        <motion.li
                            key={file.path}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            className={`nav-item ${activeFile.path === file.path ? 'active' : ''}`}
                            onClick={() => setActiveFile(file)}
                        >
                            {getIconForFile(file.name)}
                            <span>{file.name}</span>
                            {activeFile.path === file.path && (
                                <motion.div layoutId="arrow" className="ml-auto">
                                    <ArrowRight size={16} />
                                </motion.div>
                            )}
                        </motion.li>
                    ))}
                </ul>
            </motion.nav>

            {/* Main Markdown Rendering Area */}
            <main className="main-content">
                <div className="content-wrapper">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeFile.path}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                        >
                            <ReactMarkdown
                                className="markdown-body"
                                components={{
                                    a: ({ node, ...props }) => (
                                        <a {...props} onClick={(e) => handleLinkClick(e, props.href)} />
                                    ),
                                }}
                            >
                                {activeFile.content}
                            </ReactMarkdown>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
