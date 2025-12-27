import React, { useState } from 'react';
import { X, Book, BarChart3, TrendingUp, Filter, Target, Shield, Download, Image, Globe } from 'lucide-react';

interface DocumentationModalProps {
    onClose: () => void;
}

type Language = 'id' | 'en';

const CONTENT = {
    id: {
        title: 'Panduan Pengguna Trading Journal',
        welcome: 'Selamat datang di Trading Journal! Dokumen ini berisi panduan lengkap penggunaan fitur-fitur yang tersedia dalam aplikasi untuk membantu Anda mencatat, menganalisis, dan meningkatkan performa trading Anda.',
        sections: {
            analytics: {
                title: 'Dashboard & Analytics',
                desc: 'Halaman <strong>Analytics</strong> memberikan wawasan mendalam tentang kinerja trading Anda.',
                features: [
                    '<strong>Performance Overview:</strong> Ringkasan metrik utama seperti Total P&L, Win Rate, Profit Factor, dan Jumlah Trade.',
                    '<strong>Equity Curve:</strong> Grafik pertumbuhan akun Anda seiring waktu.',
                    '<strong>Monthly Performance:</strong> Breakdown performa P&L bulanan.',
                    '<strong>Strategy Distribution:</strong> Visualisasi performa berdasarkan strategi yang digunakan.',
                ],
                usage: {
                    title: 'Cara Menggunakan:',
                    steps: [
                        'Buka tab <strong>Analytics</strong>.',
                        'Gunakan filter tanggal untuk melihat performa pada periode tertentu.',
                        'Analisis grafik Equity Curve untuk melihat konsistensi pertumbuhan akun.'
                    ]
                }
            },
            trades: {
                title: 'Manajemen Trade',
                desc: 'Fitur inti untuk mencatat setiap aktivitas trading.',
                features: [
                    '<strong>Entry Trade Baru:</strong> Form lengkap untuk mencatat detail trade (Entry, Exit, Size, P&L, Notes).',
                    '<strong>Edit & Delete:</strong> Kemampuan untuk mengubah atau menghapus catatan trade.',
                ],
                usage: {
                    title: 'Cara Menggunakan:',
                    steps: [
                        'Buka tab <strong>Trades</strong>.',
                        'Klik tombol <strong>"Add Trade"</strong> atau icon tambah (+) untuk mencatat trade baru.',
                        'Isi detail trade: Symbol, Type, Entry/Exit Price, Size, Strategy, dll.',
                        'Klik <strong>Save</strong>.'
                    ]
                }
            },
            templates: {
                title: 'Trade Templates',
                desc: 'Simpan preset untuk strategi yang sering Anda gunakan untuk mempercepat entry.',
                features: [
                    '<strong>Create Template:</strong> Simpan setup favorit Anda (misal: "Breakout", "Pullback").',
                    '<strong>Quick Entry:</strong> Auto-fill form trade baru menggunakan template.',
                ],
                usage: {
                    title: 'Cara Menggunakan:',
                    steps: [
                        'Buka tab <strong>Templates</strong> dan klik <strong>"New Template"</strong>.',
                        'Isi strategi, size, dan target SL/TP.',
                        'Gunakan template dengan klik icon <strong>Copy</strong> saat mencatat trade baru.'
                    ]
                }
            },
            goals: {
                title: 'Goals Tracker',
                desc: 'Tetapkan target trading Anda dan pantau kemajuannya secara real-time.',
                features: [
                    '<strong>Flexible Goals:</strong> Target Profit, Win Rate %, Jumlah Trade, atau Max Drawdown.',
                    '<strong>Progress Bar:</strong> Visualisasi persentase pencapaian target.',
                ],
                usage: {
                    title: 'Cara Menggunakan:',
                    steps: [
                        'Buka tab <strong>Goals</strong>.',
                        'Klik <strong>"Add Goal"</strong>, pilih tipe goal dan periode waktu.',
                        'Progress akan otomatis terupdate.'
                    ]
                }
            },
            risk: {
                title: 'Risk Management',
                desc: 'Alat bantu untuk menjaga risiko trading tetap terkendali.',
                features: [
                    '<strong>Position Size Calculator:</strong> Hitung ukuran posisi ideal berdasarkan toleransi risiko.',
                    '<strong>Portfolio Risk:</strong> Analisis eksposur risiko keseluruhan akun.',
                ],
                usage: {
                    title: 'Cara Menggunakan:',
                    steps: [
                        'Buka tab <strong>Risk Management</strong>.',
                        'Gunakan kalkulator untuk menghitung lot aman sebelum entry.'
                    ]
                }
            },
            export: {
                title: 'Export & Reports',
                desc: 'Dokumentasikan perjalanan trading Anda sebagai laporan.',
                features: [
                    '<strong>Export Data:</strong> Unduh data trade ke CSV/Excel.',
                    '<strong>Generate Reports:</strong> Buat laporan performa PDF lengkap dengan grafik.',
                ]
            },
            screenshot: {
                title: 'Upload Screenshot',
                desc: 'Simpan bukti visual setup trading Anda dengan Drag & Drop saat mencatat trade.'
            }
        },
        close: 'Tutup'
    },
    en: {
        title: 'Trading Journal User Guide',
        welcome: 'Welcome to Trading Journal! This document contains a complete guide to the features available in the application to help you record, analyze, and improve your trading performance.',
        sections: {
            analytics: {
                title: 'Dashboard & Analytics',
                desc: 'The <strong>Analytics</strong> page provides deep insights into your trading performance.',
                features: [
                    '<strong>Performance Overview:</strong> Summary of key metrics like Total P&L, Win Rate, Profit Factor, and Total Trades.',
                    '<strong>Equity Curve:</strong> Chart of your account growth over time.',
                    '<strong>Monthly Performance:</strong> Breakdown of P&L performance by month.',
                    '<strong>Strategy Distribution:</strong> Visualization of performance based on strategies used.',
                ],
                usage: {
                    title: 'How to Use:',
                    steps: [
                        'Open the <strong>Analytics</strong> tab.',
                        'Use the date filter to view performance for a specific period.',
                        'Analyze the Equity Curve chart to see account growth consistency.'
                    ]
                }
            },
            trades: {
                title: 'Trade Management',
                desc: 'Core feature for recording every trading activity.',
                features: [
                    '<strong>New Trade Entry:</strong> Complete form to record trade details (Entry, Exit, Size, P&L, Notes).',
                    '<strong>Edit & Delete:</strong> Ability to modify or remove trade records.',
                ],
                usage: {
                    title: 'How to Use:',
                    steps: [
                        'Open the <strong>Trades</strong> tab.',
                        'Click the <strong>"Add Trade"</strong> button or plus (+) icon to record a new trade.',
                        'Fill in trade details: Symbol, Type, Entry/Exit Price, Size, Strategy, etc.',
                        'Click <strong>Save</strong>.'
                    ]
                }
            },
            templates: {
                title: 'Trade Templates',
                desc: 'Save presets for frequent strategies to speed up entry.',
                features: [
                    '<strong>Create Template:</strong> Save your favorite setups (e.g., "Breakout", "Pullback").',
                    '<strong>Quick Entry:</strong> Auto-fill new trade forms using templates.',
                ],
                usage: {
                    title: 'How to Use:',
                    steps: [
                        'Open the <strong>Templates</strong> tab and click <strong>"New Template"</strong>.',
                        'Fill in strategy, size, and SL/TP targets.',
                        'Use a template by clicking the <strong>Copy</strong> icon when recording a new trade.'
                    ]
                }
            },
            goals: {
                title: 'Goals Tracker',
                desc: 'Set your trading targets and track progress in real-time.',
                features: [
                    '<strong>Flexible Goals:</strong> Target Profit, Win Rate %, Trade Count, or Max Drawdown.',
                    '<strong>Progress Bar:</strong> Visualization of target achievement percentage.',
                ],
                usage: {
                    title: 'How to Use:',
                    steps: [
                        'Open the <strong>Goals</strong> tab.',
                        'Click <strong>"Add Goal"</strong>, select goal type and time period.',
                        'Progress will update automatically.'
                    ]
                }
            },
            risk: {
                title: 'Risk Management',
                desc: 'Tools to keep trading risk under control.',
                features: [
                    '<strong>Position Size Calculator:</strong> Calculate ideal position size based on risk tolerance.',
                    '<strong>Portfolio Risk:</strong> Analyze overall account risk exposure.',
                ],
                usage: {
                    title: 'How to Use:',
                    steps: [
                        'Open the <strong>Risk Management</strong> tab.',
                        'Use the calculator to calculate safe lot size before entry.'
                    ]
                }
            },
            export: {
                title: 'Export & Reports',
                desc: 'Document your trading journey as a report.',
                features: [
                    '<strong>Export Data:</strong> Download trade data to CSV/Excel.',
                    '<strong>Generate Reports:</strong> Create comprehensive PDF performance reports with charts.',
                ]
            },
            screenshot: {
                title: 'Upload Screenshot',
                desc: 'Save visual proof of your trading setups with Drag & Drop when recording trades.'
            }
        },
        close: 'Close'
    }
};

export const DocumentationModal: React.FC<DocumentationModalProps> = ({ onClose }) => {
    const [lang, setLang] = useState<Language>('id');
    const t = CONTENT[lang];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col border border-gray-200 dark:border-slate-700">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Book className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t.title}</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setLang(lang === 'id' ? 'en' : 'id')}
                            className="px-3 py-1.5 flex items-center gap-2 text-sm font-medium bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                        >
                            <Globe className="w-4 h-4" />
                            {lang === 'id' ? 'English' : 'Indonesia'}
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="overflow-y-auto p-6 space-y-8 text-gray-600 dark:text-gray-300">

                    <div className="prose dark:prose-invert max-w-none">
                        <p className="text-lg">{t.welcome}</p>
                    </div>

                    {/* Dashboard & Analytics */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                            <BarChart3 className="w-5 h-5" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t.sections.analytics.title}</h3>
                        </div>
                        <div className="bg-gray-50 dark:bg-slate-700/30 p-4 rounded-lg space-y-2">
                            <p dangerouslySetInnerHTML={{ __html: t.sections.analytics.desc }} />
                            <ul className="list-disc pl-5 space-y-1">
                                {t.sections.analytics.features.map((feature, i) => (
                                    <li key={i} dangerouslySetInnerHTML={{ __html: feature }} />
                                ))}
                            </ul>
                        </div>
                        <div className="text-sm">
                            <p className="font-semibold text-gray-700 dark:text-white mb-1">{t.sections.analytics.usage.title}</p>
                            <ol className="list-decimal pl-5 space-y-1">
                                {t.sections.analytics.usage.steps.map((step, i) => (
                                    <li key={i} dangerouslySetInnerHTML={{ __html: step }} />
                                ))}
                            </ol>
                        </div>
                    </section>

                    <hr className="border-gray-200 dark:border-slate-700" />

                    {/* Trade Management */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                            <TrendingUp className="w-5 h-5" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t.sections.trades.title}</h3>
                        </div>
                        <div className="bg-gray-50 dark:bg-slate-700/30 p-4 rounded-lg space-y-2">
                            <p dangerouslySetInnerHTML={{ __html: t.sections.trades.desc }} />
                            <ul className="list-disc pl-5 space-y-1">
                                {t.sections.trades.features.map((feature, i) => (
                                    <li key={i} dangerouslySetInnerHTML={{ __html: feature }} />
                                ))}
                            </ul>
                        </div>
                        <div className="text-sm">
                            <p className="font-semibold text-gray-700 dark:text-white mb-1">{t.sections.trades.usage.title}</p>
                            <ol className="list-decimal pl-5 space-y-1">
                                {t.sections.trades.usage.steps.map((step, i) => (
                                    <li key={i} dangerouslySetInnerHTML={{ __html: step }} />
                                ))}
                            </ol>
                        </div>
                    </section>

                    <hr className="border-gray-200 dark:border-slate-700" />

                    {/* Trade Templates */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                            <Filter className="w-5 h-5" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t.sections.templates.title}</h3>
                        </div>
                        <div className="bg-gray-50 dark:bg-slate-700/30 p-4 rounded-lg space-y-2">
                            <p dangerouslySetInnerHTML={{ __html: t.sections.templates.desc }} />
                            <ul className="list-disc pl-5 space-y-1">
                                {t.sections.templates.features.map((feature, i) => (
                                    <li key={i} dangerouslySetInnerHTML={{ __html: feature }} />
                                ))}
                            </ul>
                        </div>
                        <div className="text-sm">
                            <p className="font-semibold text-gray-700 dark:text-white mb-1">{t.sections.templates.usage.title}</p>
                            <ol className="list-decimal pl-5 space-y-1">
                                {t.sections.templates.usage.steps.map((step, i) => (
                                    <li key={i} dangerouslySetInnerHTML={{ __html: step }} />
                                ))}
                            </ol>
                        </div>
                    </section>

                    <hr className="border-gray-200 dark:border-slate-700" />

                    {/* Goals Tracker */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                            <Target className="w-5 h-5" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t.sections.goals.title}</h3>
                        </div>
                        <div className="bg-gray-50 dark:bg-slate-700/30 p-4 rounded-lg space-y-2">
                            <p dangerouslySetInnerHTML={{ __html: t.sections.goals.desc }} />
                            <ul className="list-disc pl-5 space-y-1">
                                {t.sections.goals.features.map((feature, i) => (
                                    <li key={i} dangerouslySetInnerHTML={{ __html: feature }} />
                                ))}
                            </ul>
                        </div>
                        <div className="text-sm">
                            <p className="font-semibold text-gray-700 dark:text-white mb-1">{t.sections.goals.usage.title}</p>
                            <ol className="list-decimal pl-5 space-y-1">
                                {t.sections.goals.usage.steps.map((step, i) => (
                                    <li key={i} dangerouslySetInnerHTML={{ __html: step }} />
                                ))}
                            </ol>
                        </div>
                    </section>

                    <hr className="border-gray-200 dark:border-slate-700" />

                    {/* Risk Management */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                            <Shield className="w-5 h-5" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t.sections.risk.title}</h3>
                        </div>
                        <div className="bg-gray-50 dark:bg-slate-700/30 p-4 rounded-lg space-y-2">
                            <p dangerouslySetInnerHTML={{ __html: t.sections.risk.desc }} />
                            <ul className="list-disc pl-5 space-y-1">
                                {t.sections.risk.features.map((feature, i) => (
                                    <li key={i} dangerouslySetInnerHTML={{ __html: feature }} />
                                ))}
                            </ul>
                        </div>
                        <div className="text-sm">
                            <p className="font-semibold text-gray-700 dark:text-white mb-1">{t.sections.risk.usage.title}</p>
                            <ol className="list-decimal pl-5 space-y-1">
                                {t.sections.risk.usage.steps.map((step, i) => (
                                    <li key={i} dangerouslySetInnerHTML={{ __html: step }} />
                                ))}
                            </ol>
                        </div>
                    </section>

                    <hr className="border-gray-200 dark:border-slate-700" />

                    {/* Export & Reports */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                            <Download className="w-5 h-5" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t.sections.export.title}</h3>
                        </div>
                        <div className="bg-gray-50 dark:bg-slate-700/30 p-4 rounded-lg space-y-2">
                            <p dangerouslySetInnerHTML={{ __html: t.sections.export.desc }} />
                            <ul className="list-disc pl-5 space-y-1">
                                {t.sections.export.features.map((feature, i) => (
                                    <li key={i} dangerouslySetInnerHTML={{ __html: feature }} />
                                ))}
                            </ul>
                        </div>
                    </section>

                    <hr className="border-gray-200 dark:border-slate-700" />

                    {/* Upload Screenshot */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                            <Image className="w-5 h-5" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t.sections.screenshot.title}</h3>
                        </div>
                        <div className="bg-gray-50 dark:bg-slate-700/30 p-4 rounded-lg space-y-2">
                            <p dangerouslySetInnerHTML={{ __html: t.sections.screenshot.desc }} />
                        </div>
                    </section>

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        {t.close}
                    </button>
                </div>
            </div>
        </div>
    );
};
