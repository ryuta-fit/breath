# Box Breathing Web Prototype – Requirements

## 1. 概要 (Overview)
ブラウザ上で直感的に箱呼吸 (Box Breathing) をガイドするウェブアプリを開発する。幾何学アニメーションとして膨張・収縮する円を用い、ユーザーは視覚的に呼吸のフェーズを把握できる。

## 2. 目的 (Goals)
1. 呼吸トレーニング初心者でも直感的に実践できる UI/UX を提供する。  
2. Web で動作する MVP を先にリリースし、後にモバイルアプリへ展開できる構成とする。  
3. ユーザーの継続利用を促す統計・実績機能を搭載する。

## 3. 対応プラットフォーム (Target Platforms)
- **Primary:** モダンブラウザ (Chrome, Safari, Firefox, Edge)  
- **Future:** PWA 化 → iOS / Android ストア配信を見据える

## 4. 機能要件 (Functional Requirements)
| ID | 機能 | 説明 |
|----|------|------|
| F-1 | 呼吸アニメーション | SVG で描画した円がフェーズに合わせて滑らかに膨張 (吸気) / 収縮 (呼気) する。|
| F-2 | フェーズ時間選択 | 4 秒 / 6 秒 / 8 秒 から選択可能。全フェーズ (吸気・ホールド・呼気・ホールド) に適用。|
| F-3 | Start / Stop ボタン | セッションの開始/一時停止/再開をトグル。Stop 時はアニメーション停止 & 計測一時停止。|
| F-4 | 統計表示 | ローカルに保存された累計呼吸回数、累計練習時間、連続日数 (streak) を UI 上に表示。|
| F-5 | データ永続化 | `localStorage` に統計データを保存し、ページ再訪問時に復元。|
| F-6 | PWA 対応 (将来) | Service Worker によるオフライン動作 & ホーム画面インストールを実装予定。|

## 5. 非機能要件 (Non-Functional Requirements)
- **パフォーマンス:** `requestAnimationFrame` を用い、60fps でスムーズなアニメーションを維持。  
- **アクセシビリティ:** 色覚障害を考慮した配色。音・振動など視覚以外のフィードバックはオプション化。  
- **レスポンシブ:** スマホ・タブレット・デスクトップでレイアウトが崩れない。  
- **国際化 (i18n):** 初期リリースは日本語。将来の多言語化を見据えた構造を保つ。

## 6. 技術スタック (Tech Stack)
- HTML5, CSS3 (Flexbox), JavaScript (ES6+)  
- SVG ベースアニメーション + `requestAnimationFrame`  
- ビルドツール不要のシンプル構成 (将来は Vite など導入可)  
- テスト: Jest + Testing Library (DOM)

## 7. ファイル構成 (Initial File Structure)
```
box-breathing/
├── index.html
├── style.css
├── app.js
└── claude.md  <-- 本ドキュメント
```
※ PWA 化時に `service-worker.js` & `manifest.webmanifest` を追加予定。

## 8. 画面仕様 (UI Wireframe)
```
+--------------------------------+
|  Box Breathing                 |
|                                |
|   (Expanding/Contracting)      |
|           ○                    |
|                                |
|  [Duration ▼]   4s / 6s / 8s   |
|                                |
|       [ Start ] / [ Stop ]     |
|                                |
|  Stats: 123 breaths / 10m / 🔥5 |
+--------------------------------+
```

## 9. データ定義 (LocalStorage Keys)
| Key | 型 | 内容 |
|-----|----|------|
| `bb_totalBreaths` | number | 累計呼吸回数 |
| `bb_totalSeconds` | number | 累計練習秒数 |
| `bb_lastDate` | string (YYYY-MM-DD) | 最終練習日 |
| `bb_streak` | number | 連続日数 |

## 10. 今後の拡張 (Future Enhancements)
1. 呼吸フェーズ時間を個別にカスタム入力できる設定画面。  
2. BGM / ガイド音声 / バイブレーションフィードバック。  
3. クラウド同期 & マルチデバイス統計共有。  
4. コミュニティ機能 (ランキング、チャレンジ)。

---
*最終更新: 2025-07-16*
