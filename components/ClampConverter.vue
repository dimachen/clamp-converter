<script setup>
import { ref, computed } from 'vue'

const formData = ref({
  valuesMin: null,
  valuesMax: null,
  viewportMin: null,
  viewportMax: null,
  rootFontSize: 16,
  showPixelComments: true,
  resultUnit: 'rem' // 'rem' или 'px'
})

const isInfoExpanded = ref(false)


const toggleInfo = () => {
  isInfoExpanded.value = !isInfoExpanded.value
}

const clampResult = computed(() => {
  const { valuesMin, valuesMax, viewportMin, viewportMax, rootFontSize, showPixelComments, resultUnit } = formData.value
  const viewportUnit = 'vw'

  // Проверяем, что все поля заполнены
  if (!valuesMin && valuesMin !== 0 || !valuesMax && valuesMax !== 0 || !viewportMin || !viewportMax || !rootFontSize) {
    return 'Заполните все поля'
  }

  // Проверяем, что viewport значения корректны
  if (viewportMin >= viewportMax) {
    return 'Viewport MIN должен быть меньше Viewport MAX'
  }

  // Конвертируем px в rem
  const pxToRem = (px) => px / rootFontSize
  const remToPx = (rem) => rem * rootFontSize

  // Вычисляем коэффициенты
  const valueDiff = valuesMax - valuesMin
  const viewportDiff = viewportMax - viewportMin
  const slope = valueDiff / viewportDiff
  const intercept = valuesMin - slope * viewportMin

  // Форматируем числа
  const formatNumber = (num) => {
    return Math.abs(num - Math.round(num)) < 0.001 ? Math.round(num) : Number(num.toFixed(3))
  }

  // Правильная формула для CSS clamp по Chris Burnell:
  // Change (slope) = (sizeMax - sizeMin) / (viewportMax - viewportMin)
  // A (intercept) = sizeMin - viewportMin * Change  
  // B (viewport coefficient) = 100 * Change
  // Result: clamp(sizeMin, A + B * viewportUnit, sizeMax)
  
  const change = (valuesMax - valuesMin) / (viewportMax - viewportMin)
  const interceptPx = valuesMin - viewportMin * change
  const viewportCoefficient = 100 * change
  
  let result = ''
  
  if (resultUnit === 'rem') {
    // Определяем min и max для clamp в rem
    const clampMinRem = pxToRem(Math.min(valuesMin, valuesMax))
    const clampMaxRem = pxToRem(Math.max(valuesMin, valuesMax))
    
    // Конвертируем в rem
    const interceptRem = interceptPx / rootFontSize
    const viewportCoefficientRem = viewportCoefficient

    const formattedSlope = formatNumber(viewportCoefficientRem)
    const formattedIntercept = formatNumber(interceptRem)

    // Строим calc выражение
    let calcExpression = ''

    if (formattedIntercept === 0) {
      calcExpression = `${formattedSlope}${viewportUnit}`
    } else if (formattedSlope === 0) {
      calcExpression = `${formattedIntercept}rem`
    } else {
      if (formattedIntercept >= 0) {
        calcExpression = `${formattedIntercept}rem + ${formattedSlope}${viewportUnit}`
      } else {
        calcExpression = `${formattedIntercept}rem + ${formattedSlope}${viewportUnit}`
      }
    }

    // Формируем результат в rem
    result = `clamp(${formatNumber(clampMinRem)}rem, ${calcExpression}, ${formatNumber(clampMaxRem)}rem)`
    
    // Добавляем комментарий с диапазоном в пикселях, если включено
    if (showPixelComments) {
      const minPx = Math.min(valuesMin, valuesMax)
      const maxPx = Math.max(valuesMin, valuesMax)
      result += `; /* ${minPx}px-${maxPx}px */`
    }
  } else {
    // Результат в пикселях
    const clampMinPx = Math.min(valuesMin, valuesMax)
    const clampMaxPx = Math.max(valuesMin, valuesMax)
    
    const formattedSlope = formatNumber(viewportCoefficient)
    const formattedIntercept = formatNumber(interceptPx)

    // Строим calc выражение для пикселей
    let calcExpression = ''

    if (formattedIntercept === 0) {
      calcExpression = `${formattedSlope}${viewportUnit}`
    } else if (formattedSlope === 0) {
      calcExpression = `${formattedIntercept}px`
    } else {
      if (formattedIntercept >= 0) {
        calcExpression = `${formattedIntercept}px + ${formattedSlope}${viewportUnit}`
      } else {
        calcExpression = `${formattedIntercept}px + ${formattedSlope}${viewportUnit}`
      }
    }

    // Формируем результат в пикселях (без комментариев)
    result = `clamp(${formatNumber(clampMinPx)}px, ${calcExpression}, ${formatNumber(clampMaxPx)}px)`
  }

  return result
})

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(clampResult.value)
    alert('Скопировано в буфер обмена')
  } catch (err) {
    alert('Ошибка при копировании')
  }
}
</script>

<template>
	<div class="clamp-converter__wrapper">
		<div class="clamp-converter">
			<h1>CSS Clamp Converter</h1>
			
			<div class="info-toggle">
				<button @click="toggleInfo" class="toggle-btn">
					<span class="toggle-icon" :class="{ expanded: isInfoExpanded }">▶</span>
					Как пользоваться этим сервисом
				</button>
				
				<div v-show="isInfoExpanded" class="info-content">
					<h2>Что такое CSS clamp()?</h2>
					<p>
						<code>clamp()</code> — это CSS функция, которая позволяет задать значение с ограничениями по минимуму и максимуму, 
						с плавным масштабированием между ними в зависимости от размера viewport.
					</p>
					<p>
						<strong>Синтаксис:</strong> <code>clamp(минимум, предпочтительное значение, максимум)</code>
					</p>
					
					<h3>Как использовать конвертер:</h3>
					<ol>
						<li><strong>VALUES</strong> — укажите минимальное и максимальное значения в пикселях (например, размер шрифта от 16px до 32px)</li>
						<li><strong>VIEWPORT</strong> — укажите размеры экрана в пикселях, при которых должны действовать эти значения (например, от 320px до 1200px)</li>
						<li><strong>SETTINGS</strong> — настройте базовый размер шрифта (по умолчанию 16px)</li>
						<li><strong>OPTIONS</strong> — выберите единицы измерения результата (rem или px)</li>
						<li>Получите готовую CSS функцию clamp() для копирования в ваш код</li>
					</ol>
					
					<h3>Как работает калькулятор?</h3>
					<p>
						Калькулятор использует математические формулы для создания плавного масштабирования между минимальным и максимальным значениями. 
						Вот пошаговый процесс расчёта:
					</p>
					
					<div class="formula-block">
						<h4>1. Вычисляем скорость изменения (Change)</h4>
						<p>Определяем, насколько должен изменяться размер на каждый пиксель viewport:</p>
						<div class="formula">
							<code>Change = (sizeMax - sizeMin) / (viewportMax - viewportMin)</code>
						</div>
					</div>
					
					<div class="formula-block">
						<h4>2. Находим базовое значение (Intercept)</h4>
						<p>Вычисляем константу, которая определяет начальную точку масштабирования:</p>
						<div class="formula">
							<code>Intercept = sizeMin - viewportMin × Change</code>
						</div>
					</div>
					
					<div class="formula-block">
						<h4>3. Коэффициент viewport (Viewport Coefficient)</h4>
						<p>Преобразуем скорость изменения в проценты viewport:</p>
						<div class="formula">
							<code>ViewportCoefficient = 100vw × Change</code>
						</div>
					</div>
					
					<div class="formula-block">
						<h4>4. Формируем результат</h4>
						<p>Объединяем все части в функцию clamp():</p>
						<div class="formula">
							<code>Result = clamp(sizeMin, Intercept + ViewportCoefficient, sizeMax)</code>
						</div>
					</div>
					
					<div class="example">
						<strong>Пример расчёта:</strong>
						<p>Допустим, нам нужен размер шрифта от <strong>15px</strong> до <strong>25px</strong> для viewport от <strong>1000px</strong> до <strong>1920px</strong>.</p>
						
						<div class="calculation-steps">
							<div class="step">
								<strong>Шаг 1:</strong> Change = (25 - 15) / (1920 - 1000) = 10 / 920 = 0.01087
							</div>
							<div class="step">
								<strong>Шаг 2:</strong> Intercept = 15 - 1000 × 0.01087 = 15 - 10.87 = 4.13px = 0.258rem
							</div>
							<div class="step">
								<strong>Шаг 3:</strong> ViewportCoefficient = 100 × 0.01087 = 1.087vw
							</div>
							<div class="step">
								<strong>Шаг 4:</strong> Result = <code>clamp(0.938rem, 0.258rem + 1.087vw, 1.563rem)</code>
							</div>
						</div>
						
						<div class="verification">
							<strong>Проверка:</strong>
							<p>При viewport 1000px: 0.258rem + 1.087vw = 4.13px + 10.87px ≈ 15px ✓</p>
							<p>При viewport 1920px: 0.258rem + 1.087vw = 4.13px + 20.87px ≈ 25px ✓</p>
						</div>
					</div>
					
					<div class="tip-block">
						<h4>💡 Полезный совет</h4>
						<p>
							Функция <code>clamp()</code> автоматически добавляет <code>calc()</code> для среднего значения, если оно содержит математические операции. 
							Поэтому <code>clamp(1rem, 0.5rem + 2vw, 3rem)</code> эквивалентно <code>clamp(1rem, calc(0.5rem + 2vw), 3rem)</code>.
						</p>
					</div>
					
					<div class="resources">
						<h4>Полезные ресурсы:</h4>
						<ul>
							<li><a href="https://developer.mozilla.org/en-US/docs/Web/CSS/clamp" target="_blank" rel="noopener">MDN: clamp()</a> — официальная документация</li>
							<li><a href="https://utopia.fyi/" target="_blank" rel="noopener">Utopia</a> — калькулятор для fluid типографики и сеток</li>
							<li><a href="https://chrisburnell.com/clamp-calculator/" target="_blank" rel="noopener">Chris Burnell's Calculator</a> — оригинальный калькулятор</li>
							<li><a href="https://css-tricks.com/linearly-scale-font-size-with-css-clamp-based-on-the-viewport/" target="_blank" rel="noopener">CSS-Tricks</a> — подробное руководство по clamp()</li>
						</ul>
					</div>
				</div>
			</div>
			
			<div class="form-container">
				<div class="row">
					<div class="col">
						<h3>VALUES</h3>
						<div class="input-row">
							<div class="input-group">
								<label>MIN</label>
								<input
									type="number"
									v-model.number="formData.valuesMin"
									placeholder="px"
								/>
							</div>
							<div class="input-group">
								<label>MAX</label>
								<input
									type="number"
									v-model.number="formData.valuesMax"
									placeholder="px"
								/>
							</div>
						</div>
					</div>
					
					<div class="col">
						<h3>VIEWPORT</h3>
						<div class="input-row">
							<div class="input-group">
								<label>MIN</label>
								<input
									type="number"
									v-model.number="formData.viewportMin"
									placeholder="px"
								/>
							</div>
							<div class="input-group">
								<label>MAX</label>
								<input
									type="number"
									v-model.number="formData.viewportMax"
									placeholder="px"
								/>
							</div>
						</div>
					</div>
				</div>

				<div class="row">
					<div class="col">
						<h3>НАСТРОЙКИ</h3>
						<div class="input-row">
							<div class="input-group">
								<label>Root Font Size (px)</label>
								<input
									type="number"
									v-model.number="formData.rootFontSize"
									min="1"
									placeholder="16"
								/>
							</div>
						</div>
					</div>
					
					<div class="col">
						<h3>ОПЦИИ</h3>
						<div class="input-group">
							<label>Единицы измерения результата</label>
							<select v-model="formData.resultUnit">
								<option value="rem">REM</option>
								<option value="px">Пиксели (PX)</option>
							</select>
						</div>
						<div class="checkbox-group" v-if="formData.resultUnit === 'rem'">
							<label class="checkbox-label">
								<input
									type="checkbox"
									v-model="formData.showPixelComments"
								/>
								<span class="checkmark"></span>
								Показывать комментарии в пикселях
							</label>
						</div>
					</div>
				</div>
				
				<div class="result-section">
					<label>Результат</label>
					<div class="result-container">
						<input
							type="text"
							:value="clampResult"
							readonly
							class="result-input"
						/>
						<button
							type="button"
							@click="copyToClipboard"
							:disabled="clampResult === 'Заполните все поля' || clampResult.includes('должен быть меньше')"
							class="copy-btn"
						>
							📋
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
	
	<!-- GitHub link -->
	<div class="github-link">
		<a href="https://github.com/dimachen/clamp-converter" target="_blank" rel="noopener noreferrer">
			<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
				<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
			</svg>
		</a>
	</div>
</template>

<style scoped>
.clamp-converter__wrapper {
	display: flex;
	justify-content: center;
	width: 100%;
}
.clamp-converter {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.info-toggle {
  margin-bottom: 30px;
}

.toggle-btn {
  width: 100%;
  background: #1890ff;
  color: white;
  border: none;
  padding: 15px 20px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: background-color 0.3s;
}

.toggle-btn:hover {
  background: #40a9ff;
}

.toggle-icon {
  transition: transform 0.3s;
  font-size: 12px;
}

.toggle-icon.expanded {
  transform: rotate(90deg);
}

.info-content {
  background: #f0f8ff;
  padding: 25px;
  border-radius: 0 0 8px 8px;
  border-left: 4px solid #1890ff;
  margin-top: 2px;
}

.info-content h2 {
  color: #1890ff;
  margin-bottom: 15px;
  font-size: 24px;
}

.info-content h3 {
  color: #333;
  margin: 20px 0 10px 0;
  font-size: 18px;
}

.info-content p {
  line-height: 1.6;
  margin-bottom: 15px;
  color: #555;
}

.info-content code {
  background: #e6f7ff;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  color: #1890ff;
}

.info-content ol {
  padding-left: 20px;
  margin-bottom: 20px;
}

.info-content li {
  margin-bottom: 8px;
  line-height: 1.5;
  color: #555;
}

.example {
  background: #fff;
  padding: 20px;
  border-radius: 6px;
  border: 1px solid #d9d9d9;
  margin-top: 15px;
}

.code-block {
  background: #f6f8fa;
  padding: 12px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  color: #d73a49;
  margin: 10px 0;
  border-left: 3px solid #28a745;
}

.formula-block {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 6px;
  margin: 20px 0;
  border-left: 4px solid #6c757d;
}

.formula-block h4 {
  color: #495057;
  margin: 0 0 10px 0;
  font-size: 16px;
  font-weight: 600;
}

.formula-block p {
  color: #6c757d;
  margin: 0 0 10px 0;
  font-size: 14px;
}

.formula {
  background: #fff;
  padding: 15px;
  border-radius: 4px;
  border: 1px solid #dee2e6;
  margin-top: 10px;
  text-align: center;
}

.formula code {
  background: transparent;
  color: #212529;
  font-size: 16px;
  font-weight: 500;
  padding: 0;
}

.calculation-steps {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 6px;
  margin: 15px 0;
}

.step {
  padding: 10px;
  margin: 10px 0;
  background: #fff;
  border-radius: 4px;
  border-left: 3px solid #1890ff;
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

.step strong {
  color: #1890ff;
  display: inline-block;
  margin-right: 10px;
}

.verification {
  background: #d4edda;
  padding: 15px;
  border-radius: 6px;
  margin-top: 15px;
  border: 1px solid #c3e6cb;
}

.verification strong {
  color: #155724;
  display: block;
  margin-bottom: 10px;
}

.verification p {
  color: #155724;
  margin: 5px 0;
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

.tip-block {
  background: #fff3cd;
  padding: 20px;
  border-radius: 6px;
  margin: 20px 0;
  border: 1px solid #ffeaa7;
}

.tip-block h4 {
  color: #856404;
  margin: 0 0 10px 0;
  font-size: 16px;
}

.tip-block p {
  color: #856404;
  margin: 0;
}

.resources {
  background: #e7f4ff;
  padding: 20px;
  border-radius: 6px;
  margin-top: 20px;
  border: 1px solid #b3daff;
}

.resources h4 {
  color: #004085;
  margin: 0 0 15px 0;
  font-size: 16px;
  font-weight: 600;
}

.resources ul {
  margin: 0;
  padding-left: 20px;
}

.resources li {
  margin: 8px 0;
  color: #004085;
}

.resources a {
  color: #1890ff;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.resources a:hover {
  color: #40a9ff;
  text-decoration: underline;
}

.form-container {
  background: #f9f9f9;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.row {
  display: flex;
  gap: 30px;
  margin-bottom: 30px;
}

.col {
  flex: 1;
}

h3 {
  margin-bottom: 16px;
  color: #1890ff;
  font-weight: 600;
  font-size: 18px;
}

.input-row {
  display: flex;
  gap: 15px;
}

.input-group {
  flex: 1;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #555;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

input:focus, select:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
  background-color: white;
  cursor: pointer;
}

.checkbox-group {
  display: flex;
  align-items: center;
  margin-top: 15px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  color: #555;
  font-weight: normal;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
  margin-right: 8px;
  transform: scale(1.2);
}

.checkmark {
  margin-right: 8px;
}

.result-section {
  margin-top: 20px;
}

.result-container {
  display: flex;
  gap: 10px;
}

.result-input {
  flex: 1;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  background: #fff;
  font-weight: 500;
}

.copy-btn {
  padding: 10px 15px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.copy-btn:hover:not(:disabled) {
  background: #40a9ff;
}

.copy-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .row {
    flex-direction: column;
    gap: 20px;
  }
  
  .input-row {
    flex-direction: column;
    gap: 10px;
  }
  
  .result-container {
    flex-direction: column;
  }
  
  .copy-btn {
    align-self: flex-start;
  }
}

.github-link {
  display: flex;
  justify-content: center;
  margin-top: 40px;
  padding-bottom: 20px;
}

.github-link a {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  color: #333;
  transition: color 0.3s, transform 0.2s;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.02);
}

.github-link a:hover {
  color: #1890ff;
  transform: scale(1.1);
  background: rgba(24, 144, 255, 0.1);
}
</style>