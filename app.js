// Box Breathing App
class BoxBreathing {
    constructor() {
        this.circle = document.querySelector('.breathing-circle circle');
        this.phaseText = document.querySelector('.phase-text');
        this.countdownText = document.querySelector('.countdown-text');
        this.startStopBtn = document.getElementById('startStopBtn');
        this.durationSelect = document.getElementById('duration');
        this.breathCountEl = document.getElementById('breathCount');
        this.practiceTimeEl = document.getElementById('practiceTime');
        this.streakEl = document.getElementById('streak');
        
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
        
        this.phases = [
            { name: '吸う', startScale: 1, endScale: 2 },
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
        this.durationSelect.addEventListener('change', () => {
            if (this.isRunning) {
                this.stop();
                this.start();
            }
        });
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
        this.startStopBtn.textContent = '停止';
        this.startStopBtn.classList.add('stop');
        
        if (!this.sessionStartTime) {
            this.sessionStartTime = Date.now();
        }
        
        if (this.pausedTime > 0) {
            this.totalPausedTime += Date.now() - this.pausedTime;
            this.pausedTime = 0;
        }
        
        this.phaseStartTime = Date.now();
        this.animate();
    }
    
    stop() {
        this.isRunning = false;
        this.isPaused = true;
        this.pausedTime = Date.now();
        this.startStopBtn.textContent = '開始';
        this.startStopBtn.classList.remove('stop');
        
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
    
    animate() {
        if (!this.isRunning) return;
        
        const duration = parseInt(this.durationSelect.value) * 1000;
        const elapsed = Date.now() - this.phaseStartTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const currentPhaseData = this.phases[this.currentPhase];
        
        // 滑らかな補間
        const easeProgress = this.easeInOutCubic(progress);
        const scale = currentPhaseData.startScale + (currentPhaseData.endScale - currentPhaseData.startScale) * easeProgress;
        
        const radius = 70 * scale;
        this.circle.setAttribute('r', radius);
        
        this.phaseText.textContent = currentPhaseData.name;
        
        // カウントダウン表示
        const remainingTime = Math.ceil(duration / 1000 - elapsed / 1000);
        this.countdownText.textContent = Math.max(0, remainingTime);
        
        if (progress >= 1) {
            this.currentPhase = (this.currentPhase + 1) % this.phases.length;
            this.phaseStartTime = Date.now();
            
            if (this.currentPhase === 0) {
                this.breathCount++;
                this.updateStatsDisplay();
            }
        }
        
        this.animationId = requestAnimationFrame(() => this.animate());
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

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', () => {
    new BoxBreathing();
});