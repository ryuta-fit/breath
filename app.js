// Box Breathing App
class BoxBreathing {
    constructor() {
        this.circle = document.querySelector('.breathing-circle circle');
        this.phaseText = document.querySelector('.phase-text');
        this.countdownText = document.querySelector('.countdown-text');
        this.startStopBtn = document.getElementById('startStopBtn');
        this.durationButtons = document.querySelectorAll('.duration-btn');
        this.breathCountEl = document.getElementById('breathCount');
        this.practiceTimeEl = document.getElementById('practiceTime');
        this.streakEl = document.getElementById('streak');
        this.currentDuration = 4;
        
        this.isRunning = false;
        this.isPaused = false;
        this.animationId = null;
        this.startTime = null;
        this.pausedTime = 0;
        this.totalPausedTime = 0;
        this.currentPhase = 0;
        this.phaseStartTime = null;
        this.breathCount = 0;
        this.sessionStartTime = null;
        
        // Performance monitoring
        this.frameCount = 0;
        this.lastFrameTime = 0;
        this.fps = 60;
        
        this.phases = [
            { name: '鼻から吸う', startScale: 1, endScale: 2 },
            { name: '止める', startScale: 2, endScale: 2 },
            { name: '吐く', startScale: 2, endScale: 1 },
            { name: '止める', startScale: 1, endScale: 1 }
        ];
        
        this.init();
    }
    
    init() {
        this.loadStats();
        this.setupEventListeners();
        this.updateStatsDisplay();
    }
    
    setupEventListeners() {
        this.startStopBtn.addEventListener('click', () => this.toggleBreathing());
        
        // キーボードサポート（スペースキーで開始/停止）
        this.startStopBtn.addEventListener('keydown', (e) => {
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                this.toggleBreathing();
            }
        });
        
        this.durationButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const newDuration = parseInt(e.target.dataset.duration);
                this.setDuration(newDuration);
            });
            
            // キーボードサポート（矢印キーで選択）
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                    e.preventDefault();
                    const buttons = Array.from(this.durationButtons);
                    const currentIndex = buttons.indexOf(e.target);
                    let newIndex;
                    
                    if (e.key === 'ArrowLeft') {
                        newIndex = currentIndex > 0 ? currentIndex - 1 : buttons.length - 1;
                    } else {
                        newIndex = currentIndex < buttons.length - 1 ? currentIndex + 1 : 0;
                    }
                    
                    buttons[newIndex].focus();
                    buttons[newIndex].click();
                }
            });
        });
    }
    
    setDuration(duration) {
        this.currentDuration = duration;
        
        // ボタンのアクティブ状態を更新
        this.durationButtons.forEach(btn => {
            if (parseInt(btn.dataset.duration) === duration) {
                btn.classList.add('active');
                btn.setAttribute('aria-checked', 'true');
            } else {
                btn.classList.remove('active');
                btn.setAttribute('aria-checked', 'false');
            }
        });
        
        // 実行中の場合は再スタート
        if (this.isRunning) {
            this.stop();
            this.start();
        }
    }
    
    toggleBreathing() {
        if (!this.isRunning) {
            this.start();
        } else {
            this.stop();
        }
    }
    
    start() {
        this.isRunning = true;
        this.isPaused = false;
        this.startStopBtn.textContent = '';
        this.startStopBtn.classList.add('stop');
        this.startStopBtn.setAttribute('aria-label', '呼吸を停止する');
        document.body.classList.add('breathing-active');
        document.querySelector('.breathing-area').classList.add('active');
        
        if (!this.sessionStartTime) {
            this.sessionStartTime = Date.now();
        }
        
        if (this.pausedTime > 0) {
            this.totalPausedTime += Date.now() - this.pausedTime;
            this.pausedTime = 0;
        }
        
        // 準備中の表示
        this.phaseText.textContent = '準備中...';
        this.countdownText.textContent = '2';
        
        // 2秒待ってから吐くフェーズ（フェーズ2）から開始
        setTimeout(() => {
            this.currentPhase = 2; // 吐くフェーズから開始
            this.phaseStartTime = Date.now();
            // 開始時のスケールを吐くフェーズの開始値に設定
            const startRadius = 70 * 2; // フェーズ2の開始スケール
            this.circle.setAttribute('r', startRadius);
            this.animate();
        }, 2000);
        
        // カウントダウン表示
        setTimeout(() => {
            this.countdownText.textContent = '1';
        }, 1000);
    }
    
    stop() {
        this.isRunning = false;
        this.isPaused = true;
        this.pausedTime = Date.now();
        this.startStopBtn.textContent = '';
        this.startStopBtn.classList.remove('stop');
        this.startStopBtn.setAttribute('aria-label', '呼吸を開始する');
        document.body.classList.remove('breathing-active');
        document.querySelector('.breathing-area').classList.remove('active');
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // リセット表示
        this.phaseText.textContent = '準備中';
        this.countdownText.textContent = '0';
        this.currentPhase = 0;
        
        this.updateStats();
        this.saveStats();
    }
    
    animate(timestamp) {
        if (!this.isRunning) return;
        
        // FPS計測
        if (this.lastFrameTime) {
            const delta = timestamp - this.lastFrameTime;
            this.fps = Math.round(1000 / delta);
            
            // デバッグモードの場合のみFPS表示（開発者向け）
            if (window.location.hash === '#debug') {
                console.log(`FPS: ${this.fps}`);
            }
        }
        this.lastFrameTime = timestamp;
        
        const duration = this.currentDuration * 1000;
        const elapsed = Date.now() - this.phaseStartTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const currentPhaseData = this.phases[this.currentPhase];
        
        // 滑らかな補間
        const easeProgress = this.easeInOutCubic(progress);
        const scale = currentPhaseData.startScale + (currentPhaseData.endScale - currentPhaseData.startScale) * easeProgress;
        
        const baseRadius = this.isRunning ? 70 : 60;
        const radius = baseRadius * scale;
        
        // パフォーマンス最適化: 変更がある場合のみDOM更新
        const currentRadius = this.circle.getAttribute('r');
        if (currentRadius !== radius.toString()) {
            this.circle.setAttribute('r', radius);
        }
        
        // テキスト更新の最適化
        if (this.phaseText.textContent !== currentPhaseData.name) {
            this.phaseText.textContent = currentPhaseData.name;
        }
        
        // カウントダウン表示
        const remainingTime = Math.ceil(duration / 1000 - elapsed / 1000);
        const currentCountdown = this.countdownText.textContent;
        if (currentCountdown !== remainingTime.toString()) {
            this.countdownText.textContent = Math.max(0, remainingTime);
        }
        
        if (progress >= 1) {
            this.currentPhase = (this.currentPhase + 1) % this.phases.length;
            this.phaseStartTime = Date.now();
            
            if (this.currentPhase === 0) {
                this.breathCount++;
                this.updateStatsDisplay();
            }
        }
        
        this.animationId = requestAnimationFrame((ts) => this.animate(ts));
    }
    
    easeInOutCubic(t) {
        // リニアな動きで均一な速度
        return t;
    }
    
    updateStats() {
        if (!this.sessionStartTime) return;
        
        const sessionDuration = Date.now() - this.sessionStartTime - this.totalPausedTime;
        const stats = this.getStats();
        
        stats.totalBreaths += this.breathCount;
        stats.totalSeconds += Math.floor(sessionDuration / 1000);
        
        const today = new Date().toISOString().split('T')[0];
        if (stats.lastDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            
            if (stats.lastDate === yesterdayStr) {
                stats.streak++;
            } else {
                stats.streak = 1;
            }
            stats.lastDate = today;
        }
        
        this.saveStatsToStorage(stats);
        
        // セッションリセット
        this.breathCount = 0;
        this.sessionStartTime = null;
        this.totalPausedTime = 0;
    }
    
    getStats() {
        return {
            totalBreaths: parseInt(localStorage.getItem('bb_totalBreaths') || '0'),
            totalSeconds: parseInt(localStorage.getItem('bb_totalSeconds') || '0'),
            lastDate: localStorage.getItem('bb_lastDate') || '',
            streak: parseInt(localStorage.getItem('bb_streak') || '0')
        };
    }
    
    saveStatsToStorage(stats) {
        localStorage.setItem('bb_totalBreaths', stats.totalBreaths.toString());
        localStorage.setItem('bb_totalSeconds', stats.totalSeconds.toString());
        localStorage.setItem('bb_lastDate', stats.lastDate);
        localStorage.setItem('bb_streak', stats.streak.toString());
    }
    
    loadStats() {
        const stats = this.getStats();
        this.updateStatsDisplay();
    }
    
    saveStats() {
        this.updateStats();
    }
    
    updateStatsDisplay() {
        const stats = this.getStats();
        const totalBreaths = stats.totalBreaths + this.breathCount;
        
        this.breathCountEl.textContent = totalBreaths;
        
        const totalMinutes = Math.floor(stats.totalSeconds / 60);
        if (totalMinutes >= 60) {
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            this.practiceTimeEl.textContent = `${hours}時間${minutes}分`;
        } else {
            this.practiceTimeEl.textContent = `${totalMinutes}分`;
        }
        
        this.streakEl.textContent = `🔥${stats.streak}`;
    }
}

// スクロールアニメーション機能
class ScrollAnimations {
    constructor() {
        this.benefitsSection = document.querySelector('.benefits-section');
        this.scrollIndicator = document.querySelector('.scroll-indicator');
        this.scrollToTopBtn = document.querySelector('.scroll-to-top');
        this.animateElements = document.querySelectorAll('[data-animate]');
        
        this.init();
    }
    
    init() {
        this.setupIntersectionObserver();
        this.setupScrollIndicator();
        this.setupScrollToTop();
        this.checkInitialVisibility();
    }
    
    setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    
                    // benefits-sectionが見えたらスクロールインジケーターを隠す
                    if (entry.target.classList.contains('benefits-section')) {
                        this.benefitsSection.classList.add('visible');
                        this.scrollIndicator.classList.add('hidden');
                    }
                }
            });
        }, options);
        
        // benefits-sectionを監視
        if (this.benefitsSection) {
            observer.observe(this.benefitsSection);
        }
        
        // 各アニメーション要素を監視
        this.animateElements.forEach(element => {
            observer.observe(element);
        });
    }
    
    setupScrollIndicator() {
        if (!this.scrollIndicator) return;
        
        // スクロールインジケーターをクリックした時の動作
        this.scrollIndicator.addEventListener('click', () => {
            this.benefitsSection.scrollIntoView({ behavior: 'smooth' });
        });
        
        // スクロール位置に応じて表示/非表示
        window.addEventListener('scroll', () => {
            const scrollPosition = window.scrollY;
            const windowHeight = window.innerHeight;
            
            if (scrollPosition > windowHeight * 0.5) {
                this.scrollIndicator.classList.add('hidden');
            } else {
                this.scrollIndicator.classList.remove('hidden');
            }
        });
    }
    
    setupScrollToTop() {
        if (!this.scrollToTopBtn) return;
        
        this.scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    checkInitialVisibility() {
        // 初期表示時に既に見えている要素をアニメーション
        const windowHeight = window.innerHeight;
        
        this.animateElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            if (rect.top < windowHeight && rect.bottom > 0) {
                setTimeout(() => {
                    element.classList.add('animate-in');
                }, 100);
            }
        });
    }
}

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', () => {
    new BoxBreathing();
    new ScrollAnimations();
});