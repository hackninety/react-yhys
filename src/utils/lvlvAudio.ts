/**
 * 律吕声音频引擎
 * 基于 Web Audio API 与三分损益法
 */

// 基准频率：黄钟（C3，参考值 130.81Hz，这里定为 130.81）
const BASE_FREQ = 130.81;

// 三分损益法生成十二律精确频率（依生成顺序：黄钟 -> 林钟 -> 太簇 -> 南吕...）
// 规则：
// 1. 损一：上一音频率 * (3/2) （弦长 2/3，频率成反比）
// 2. 益一：上一音频率 * (3/4) （弦长 4/3，频率成反比）
// 实际算法中，为了保持在同一个八度内（即频率在 BASE_FREQ * 1 到 BASE_FREQ * 2 之间），
// 我们统一定义生律规则：乘 3/2（上五度），若结果超过 2 倍基频，则减半（即乘 3/4，下四度）。
function generateFrequencies(): number[] {
  const freqs = new Array(12);
  let currentFreq = BASE_FREQ;
  
  // 十二律生成顺序（生律次序）：
  // 黄钟(0) -> 林钟(7) -> 太簇(2) -> 南吕(9) -> 姑洗(4) -> 应钟(11) ->
  // 蕤宾(6) -> 大吕(1) -> 夷则(8) -> 夹钟(3) -> 无射(10) -> 仲吕(5)
  const order = [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5];
  
  for (let i = 0; i < 12; i++) {
    const idx = order[i];
    freqs[idx] = currentFreq;
    
    // 计算下一个音
    currentFreq = currentFreq * (3 / 2);
    if (currentFreq >= BASE_FREQ * 2) {
      currentFreq = currentFreq / 2;
    }
  }
  
  return freqs;
}

export const LVLV_FREQUENCIES = generateFrequencies();

// 保存音频上下文，支持延迟初始化避免浏览器策略拦截
let audioCtx: AudioContext | null = null;
let currentOscillators: OscillatorNode[] = [];
let currentGainNodes: GainNode[] = [];

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function stopLvlvAudio() {
  const now = audioCtx ? audioCtx.currentTime : 0;
  
  currentGainNodes.forEach(gain => {
    try {
      // 快速淡出，避免爆音
      gain.gain.cancelScheduledValues(now);
      gain.gain.setTargetAtTime(0, now, 0.05);
    } catch(e) {}
  });

  currentOscillators.forEach(osc => {
    try {
      osc.stop(now + 0.1);
    } catch(e) {}
  });
  
  currentOscillators = [];
  currentGainNodes = [];
}

/**
 * 播放指定律吕的音高（带有基础泛音合成）
 * @param index 律吕索引（0-11）
 * @param duration 时长（秒）
 * @param volume 主音量
 * @returns 播放结束的 Promise
 */
export function playLvlvTone(index: number, duration: number = 2.5, volume: number = 0.5): Promise<void> {
  return new Promise((resolve) => {
    const ctx = getAudioContext();
    const baseFreq = LVLV_FREQUENCIES[index];
    const now = ctx.currentTime;
    
    // 主音量节点（控制整体淡入淡出）
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
    masterGain.gain.setValueAtTime(0, now);
    
    // ADSR包络：平滑起音(Attack)，缓慢衰减(Decay/Release)
    const attackTime = 0.1;
    const releaseTime = duration * 0.6;
    
    masterGain.gain.linearRampToValueAtTime(volume, now + attackTime);
    masterGain.gain.setTargetAtTime(0, now + attackTime + 0.1, releaseTime / 3);
    
    currentGainNodes.push(masterGain);

    // 泛音合成参数 [频率倍数, 相对音量, 波形]
    const overtones: [number, number, OscillatorType][] = [
      [1.0, 1.0, 'sine'],      // 基频
      [2.0, 0.4, 'sine'],      // 2倍频（高八度）
      [3.0, 0.2, 'triangle'],  // 3倍频（纯十二度，增加明亮度）
      [4.0, 0.1, 'sine'],      // 4倍频
      [0.5, 0.15, 'sine']      // 0.5倍频（低八度，增加厚重感）
    ];

    const nodes = overtones.map(([mult, relVol, type]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(baseFreq * mult, now);
      
      gain.gain.value = relVol;
      
      osc.connect(gain);
      gain.connect(masterGain);
      
      osc.start(now);
      osc.stop(now + duration);
      
      currentOscillators.push(osc);
      return osc;
    });

    // 监听主振荡器结束
    nodes[0].onended = () => {
      // 清理相关节点引用（简单过滤）
      nodes.forEach(n => {
        const i = currentOscillators.indexOf(n);
        if (i > -1) currentOscillators.splice(i, 1);
      });
      const mgIdx = currentGainNodes.indexOf(masterGain);
      if (mgIdx > -1) currentGainNodes.splice(mgIdx, 1);
      
      resolve();
    };
  });
}

/**
 * 连续播放四柱律吕
 * @param indexes 四柱律吕索引数组
 */
export async function playFourPillarsLv(indexes: number[]) {
  stopLvlvAudio(); // 先停止之前的播放
  
  for (let i = 0; i < indexes.length; i++) {
    // 四柱每个音叠接播放：前一个音释放时，下一个音起（间隔0.6秒）
    playLvlvTone(indexes[i], 3.0, 0.6);
    if (i < indexes.length - 1) {
      await new Promise(r => setTimeout(r, 600));
    }
  }
}
