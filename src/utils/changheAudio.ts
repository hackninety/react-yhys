/**
 * 声音唱和发音引擎
 * 复用 lvlvAudio 律吕音高 + Web Speech API 汉字朗读
 * 
 * 邵雍声音唱和图：天声(韵母) × 地音(声母) = 汉字发音
 * 点击例字时，同时播放：
 * 1. SpeechSynthesis 朗读汉字（准确发音）
 * 2. lvlvAudio 播放天干对应律吕音高（背景音）
 */

import { playLvlvTone, stopLvlvAudio } from './lvlvAudio'

// 天干索引(0-9) → 律吕索引(0-11) 映射（天干五合化）
// 甲己→黄钟(0), 乙庚→太簇(2), 丙辛→姑洗(4), 丁壬→蕤宾(6), 戊癸→夷则(8)
const GAN_TO_LV: number[] = [0, 2, 4, 6, 8, 0, 2, 4, 6, 8]



/**
 * 获取中文语音（优先选择普通话）
 */
function getChineseVoice(): SpeechSynthesisVoice | null {
  const voices = speechSynthesis.getVoices()
  // 优先匹配 zh-CN
  const zhCN = voices.find(v => v.lang === 'zh-CN')
  if (zhCN) return zhCN
  // 其次匹配任何中文
  const zh = voices.find(v => v.lang.startsWith('zh'))
  if (zh) return zh
  return null
}

/**
 * 停止所有唱和音频（语音 + 律吕）
 */
export function stopChangheAudio() {
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel()
  }
  stopLvlvAudio()
}

/**
 * 朗读汉字 + 播放对应律吕背景音
 * @param char 要发音的汉字
 * @param tianShengIndex 天声组索引 (0-9)，映射到律吕音高
 * @returns Promise，发音结束后 resolve
 */
export function speakChangheChar(char: string, tianShengIndex: number): Promise<void> {
  return new Promise((resolve) => {
    // 先停止之前的播放
    stopChangheAudio()

    // 1. 播放律吕背景音（短促，1.2秒）
    const lvIndex = GAN_TO_LV[tianShengIndex % 10]
    playLvlvTone(lvIndex, 1.2, 0.25)

    // 2. 用 Web Speech API 朗读汉字
    const utterance = new SpeechSynthesisUtterance(char)
    utterance.lang = 'zh-CN'
    utterance.rate = 0.8  // 稍慢，清晰
    utterance.pitch = 1.0
    utterance.volume = 1.0

    const voice = getChineseVoice()
    if (voice) {
      utterance.voice = voice
    }

    utterance.onend = () => {
      resolve()
    }
    utterance.onerror = () => {
      resolve()
    }

    speechSynthesis.speak(utterance)
  })
}

/**
 * 检查浏览器是否支持语音合成
 */
export function isSpeechSupported(): boolean {
  return typeof speechSynthesis !== 'undefined'
}
