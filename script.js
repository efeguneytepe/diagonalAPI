 // State variables
 let selectedShape = null;
 let shapeCounter = 0;
 let offsetX, offsetY;
 let isResizing = false;
 const gridSize = 20;
 
 let lineMode = false;
 let lineStart = null;
 const lines = []; // { from, to, element }
 
 let orthoLineMode = false;
 let orthoLineStart = null;
 const orthoLines = []; // { from, to, horizontal, vertical }

 let urgoLineMode = false;
 let urgoLineStart = null;
 const urgoLines = []; // { from, to, horizontal, vertical }
 
 let paintBrushMode = false;

 // Dosyanızın en üst kısmına ekleyebilirsiniz:
function rgbToHex(rgb) {
  const result = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/.exec(rgb);
  return result
    ? "#" +
      ("0" + parseInt(result[1], 10).toString(16)).slice(-2) +
      ("0" + parseInt(result[2], 10).toString(16)).slice(-2) +
      ("0" + parseInt(result[3], 10).toString(16)).slice(-2)
    : rgb;
}

 
 
 // Şekil id'lerini takip etmek için obje
 const shapeRegistry = {};
function removeResizeHandle(shape) {
  const handle = shape.querySelector('.resize-handle');
  if (handle) { handle.remove(); }
}
document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const canvas = document.getElementById('canvas');
  const colorPickerTrigger = document.getElementById('colorPickerTrigger');
  const colorPickerPopup = document.getElementById('colorPickerPopup');
  const currentColorSwatch = document.getElementById('currentColorSwatch');
  const customColorPicker = document.getElementById('customColorPicker');
  const shapeColorInput = document.getElementById('shapeColor');
  const themeColorsContainer = document.getElementById('themeColors');
  const standardColorsContainer = document.getElementById('standardColors');
  const recentColorsContainer = document.getElementById('recentColors');
  const deleteBtn = document.getElementById('deleteBtn');
  const lineBtn = document.getElementById('lineBtn');
  const orthoLineBtn = document.getElementById('orthoLineBtn');
  const urgoLineBtn = document.getElementById('urgoLineBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const clearBtn = document.getElementById('clearBtn');
  const saveJsonBtn = document.getElementById('saveJsonBtn');
  const loadJsonBtn = document.getElementById('loadJsonBtn');
  const jsonFileInput = document.getElementById('jsonFileInput');
  const paintBrushBtn = document.getElementById('paintBrushBtn');
  const shapeCount = document.getElementById('shapeCount');
  const shapeButtons = document.querySelectorAll('.shape-btn');
  const jsonEditor = document.getElementById('jsonEditor');
  const jsonGenerateBtn = document.getElementById('jsonGenerateBtn');
  const formGenerateBtn = document.getElementById('formGenerateBtn');
  const jsonTabs = document.querySelectorAll('.json-tab');
  const jsonTabContents = document.querySelectorAll('.json-tab-content');
  const addItemBtn = document.getElementById('addItemBtn');
  const updateJsonBtn = document.getElementById('updateJsonBtn');
  const itemList = document.getElementById('jsonItemList');
  const itemTextInput = document.getElementById('itemText');
  const itemLevelSelect = document.getElementById('itemLevel');
  const itemIdInput = document.getElementById('itemId');
  const itemConnectedToSelect = document.getElementById('itemConnectedTo');
  const excelUploadBtn = document.getElementById('excelUploadBtn');
  const excelInput = document.getElementById('excelInput');

  // Text ayarları kontrolleri
  const fontSizeSelect = document.getElementById('fontSizeSelect');
const boldToggle = document.getElementById('boldToggle');
const italicToggle = document.getElementById('italicToggle');
const fontFamilySelect = document.getElementById('fontFamilySelect');
  const textCurrentColorSwatch = document.getElementById('textCurrentColorSwatch');
const textColorValue = document.getElementById('textColorValue');


  // Fonksiyonları global olarak erişilebilir yapma 
window.updateLines = function(shape) {
  updateConnectedLines(shape);
  updateOrthogonalLines(shape);
  updateUrgotonalLines(shape);
};
  
  // Son kullanılan renkler dizisi
  const recentColors = [];
  const maxRecentColors = 10;

  // Color configurations
  const themeColors = [
    '#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', 
    '#1abc9c', '#e67e22', '#34495e', '#2980b9', '#27ae60'
  ];

  const standardColors = [
    '#000000', '#7f7f7f', '#880015', '#ed1c24', '#ff7f27', 
    '#fff200', '#22b14c', '#00a2e8', '#3f48cc', '#a349a4',
    '#ffffff', '#c3c3c3', '#b97a57', '#ffaec9', '#ffc90e', 
    '#efe4b0', '#b5e61d', '#99d9ea', '#7092be', '#c8bfe7'
  ];

  // Initialize color picker
  function initColorPicker() {
    // Set initial color
    const initialColor = '#3498db';
    updateSelectedColor(initialColor);
    
    // Generate theme colors
    themeColors.forEach(color => {
      addColorItem(themeColorsContainer, color);
    });
    
    // Generate standard colors
    standardColors.forEach(color => {
      addColorItem(standardColorsContainer, color);
    });
    
    // Update recent colors
    updateRecentColorsDisplay();
    
    // Toggle color picker popup
    colorPickerTrigger.addEventListener('click', function(e) {
      e.stopPropagation();
      colorPickerPopup.classList.toggle('active');
    });
    
    // Close color picker when clicking outside
    document.addEventListener('click', function(e) {
      if (!colorPickerTrigger.contains(e.target)) {
        colorPickerPopup.classList.remove('active');
      }
    });
    
    // Custom color picker
    customColorPicker.addEventListener('input', function() {
      updateSelectedColor(this.value);
    });
  }
  
  // Add a color item to a container
  function addColorItem(container, color) {
    const colorItem = document.createElement('div');
    colorItem.className = 'color-item';
    colorItem.style.backgroundColor = color;
    colorItem.addEventListener('click', function() {
      updateSelectedColor(color);
    });
    container.appendChild(colorItem);
  }
  
  // Update selected color
  function updateSelectedColor(color) {
    shapeColorInput.value = color;
    currentColorSwatch.style.backgroundColor = color;
    customColorPicker.value = color;
    
    // Apply color to selected shape if any
    if (selectedShape) {
      applyColorToShape(selectedShape, color);
    }
    
    // Add to recent colors
    addToRecentColors(color);
    
    // Close popup
    colorPickerPopup.classList.remove('active');
  }
  
  // Add color to recent colors list
  function addToRecentColors(color) {
    // Check if color already exists in recent colors
    const index = recentColors.indexOf(color);
    if (index !== -1) {
      // Remove from current position
      recentColors.splice(index, 1);
    }
    
    // Add to beginning of array
    recentColors.unshift(color);
    
    // Keep only the maximum number of recent colors
    if (recentColors.length > maxRecentColors) {
      recentColors.pop();
    }
    
    // Update display
    updateRecentColorsDisplay();
  }
  
  // Update recent colors display
  function updateRecentColorsDisplay() {
    recentColorsContainer.innerHTML = '';
    recentColors.forEach(color => {
      addColorItem(recentColorsContainer, color);
    });
  }
  
  // Paint Brush functionality
  paintBrushBtn.addEventListener('click', function() {
paintBrushMode = !paintBrushMode;
this.classList.toggle('active', paintBrushMode);

if (paintBrushMode) {
// Deselect any selected shape to avoid interference
if (selectedShape) {
  deselectShape(selectedShape);
  selectedShape = null;
}

// Disable other modes
lineMode = false;
lineBtn.classList.remove('active');
if (lineStart) {
  lineStart.classList.remove('line-start');
  lineStart = null;
}

orthoLineMode = false;
orthoLineBtn.classList.remove('active');
if (orthoLineStart) {
  orthoLineStart.classList.remove('line-start');
  orthoLineStart = null;
}

urgoLineMode = false;
urgoLineBtn.classList.remove('active');
if (urgoLineStart) {
  urgoLineStart.classList.remove('line-start');
  urgoLineStart = null;
}



// Update status for user feedback
const statusInfo = document.querySelector('.status-info');
statusInfo.innerHTML = '<i class="fas fa-paint-brush"></i> Boyama modu aktif';
} else {
// Reset to normal mode
const statusInfo = document.querySelector('.status-info');
statusInfo.innerHTML = '<i class="fas fa-check-circle"></i> Hazır';
}
});


function setupShapeEventListeners(shape) {
  // Mouse down olayı - sürükleme için
  shape.addEventListener('mousedown', startDrag);

  // Çift tıklama olayı - metin düzenleyici için
  shape.addEventListener('dblclick', function(e) {
    e.stopPropagation();
    openRichTextEditor(shape);
  });

  // Tıklama olayı - seçim veya boyama için
  shape.addEventListener('click', function(e) {
    e.stopPropagation();

    // Boya fırçası modu kontrolü
    if (paintBrushMode) {
      const currentColor = document.getElementById('shapeColor').value;
      applyColorToShape(this, currentColor);
      return;
    }

    // Çizgi modları kontrolü
    if (lineMode) {
      if (!lineStart) {
        lineStart = this;
        this.classList.add('line-start');
      } else {
        if (this === lineStart) return;
        createLine(lineStart, this);
        lineStart.classList.remove('line-start');
        lineStart = null;
        lineMode = false;
        lineBtn.classList.remove('active');
      }
    } else if (orthoLineMode) {
      if (!orthoLineStart) {
        orthoLineStart = this;
        this.classList.add('line-start');
      } else {
        if (this === orthoLineStart) return;
        createOrthogonalLine(orthoLineStart, this);
        orthoLineStart.classList.remove('line-start');
        orthoLineStart = null;
        orthoLineMode = false;
        orthoLineBtn.classList.remove('active');
      }
    } else if (urgoLineMode) {
      if (!urgoLineStart) {
        urgoLineStart = this;
        this.classList.add('line-start');
      } else {
        if (this === urgoLineStart) return;
        createUrgotonalLines(urgoLineStart, this);
        urgoLineStart.classList.remove('line-start');
        urgoLineStart = null;
        urgoLineMode = false;
        document.getElementById('urgoLineBtn').classList.remove('active');
      }
    } else {
      // Normal tıklama - şekli seç
      selectShape(this);
    }
  });
  
  return shape; // Zincirleme metodlar için şekli döndür
}
// Mevcut createShape fonksiyonunu güncellemek yerine, bu değişiklikleri setupShapeEventListeners
// içinde yapıp, createShape içinde bu fonksiyonu çağırmak daha iyi olacaktır.

// 4. createShape fonksiyonunu değiştirin ve setupShapeEventListeners kullanın:

function createShape(type) {
  const shape = document.createElement('div');
  shape.className = `shape ${type}`;
  shape.id = `shape-${shapeCounter++}`;

  // Get color from input
  const shapeColor = shapeColorInput.value;

  // Şekil tipine göre stil uygula
  if (type === 'triangle') {
    // Üçgen için özel stil
    shape.style.width = '0';
    shape.style.height = '0';
    shape.style.borderLeft = '50px solid transparent';
    shape.style.borderRight = '50px solid transparent';
    shape.style.borderBottom = `100px solid ${shapeColor}`;
  } else if (type === 'circle') {
    // Çember için özel stil
    shape.style.width = '100px';
    shape.style.height = '100px';
    shape.style.borderRadius = '50%';
    shape.style.backgroundColor = shapeColor;
  } else {
    // Kare ve dikdörtgen için normal stil
    shape.style.backgroundColor = shapeColor;
    
    if (type === 'rectangle') {
      shape.style.width = '150px';
      shape.style.height = '100px';
    } else if (type === 'square') {
      shape.style.width = '100px';
      shape.style.height = '100px';
    }
  }
  
  const left = Math.round((Math.random() * (canvas.clientWidth - 100) + 50) / gridSize) * gridSize;
  const top = Math.round((Math.random() * (canvas.clientHeight - 100) + 50) / gridSize) * gridSize;
  shape.style.left = `${left}px`;
  shape.style.top = `${top}px`;
  
  // Olay dinleyicileri eklemek için setupShapeEventListeners fonksiyonunu kullan
  setupShapeEventListeners(shape);
  
  canvas.appendChild(shape);
  
  // Sadece gerektiğinde seç
  if (!lineMode && !orthoLineMode && !urgoLineMode && !paintBrushMode) {
    selectShape(shape);
  }
  
  updateShapeCount();
  
  return shape;
}

  // Örnek JSON verisi
  const sampleJson = [
    {
      "text": "Ana Başlık",
      "level": 1,
      "id": "item1"
    },
    {
      "text": "Alt Başlık 1",
      "level": 2,
      "id": "item2",
      "connectedTo": "item1"
    },
    {
      "text": "Alt Başlık 2",
      "level": 2,
      "id": "item3",
      "connectedTo": "item1"
    },
    {
      "text": "Alt Başlık 3",
      "level": 2,
      "id": "item5",
      "connectedTo": "item1"
    },
    {
      "text": "Alt Başlık 1.1",
      "level": 3,
      "id": "item4",
      "connectedTo": "item2"
    },
    {
      "text": "Ekip Üyesi 1",
      "level": 3,
      "id": "item6",
      "connectedTo": "item5"
    },
    {
      "text": "Ekip Üyesi 2",
      "level": 3,
      "id": "item7",
      "connectedTo": "item5"
    },
    {
      "text": "Ekip Üyesi 3",
      "level": 3,
      "id": "item8",
      "connectedTo": "item5"
    },
    {
      "text": "Ekip Üyesi 4",
      "level": 3,
      "id": "item9",
      "connectedTo": "item5"
    },
    {
      "text": "Ekip Üyesi 5",
      "level": 3,
      "id": "item10",
      "connectedTo": "item5"
    },
    {
      "text": "Ekip Üyesi 6",
      "level": 3,
      "id": "item11",
      "connectedTo": "item5"
    },
    {
      "text": "Ekip Üyesi 7",
      "level": 3,
      "id": "item12",
      "connectedTo": "item5"
    },
    {
      "text": "Üye 1.1",
      "level": 4,
      "id": "item13",
      "connectedTo": "item6"
    },
    {
      "text": "Üye 2.1",
      "level": 4,
      "id": "item14",
      "connectedTo": "item7"
    }
  ];
  
  // Örnek JSON verisini editöre yükle
  jsonEditor.value = JSON.stringify(sampleJson, null, 2);

  // Şekil butonları
  shapeButtons.forEach(button => {
    button.addEventListener('click', function() {
      const shapeType = this.getAttribute('data-shape');
      createShape(shapeType);
    });
  });

  // JSON işlemleri
  jsonGenerateBtn.addEventListener('click', generateDiagramFromJson);
  formGenerateBtn.addEventListener('click', generateDiagramFromForm);
  saveJsonBtn.addEventListener('click', saveJsonData);
  loadJsonBtn.addEventListener('click', function() {
    jsonFileInput.click();
  });
  
  jsonFileInput.addEventListener('change', loadJsonData);
  
  // Excel yükleme
  excelUploadBtn.addEventListener('click', function() {
    excelInput.click();
  });
  
  excelInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      // İlk çalışma sayfasını seçiyoruz
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      // Çalışma sayfasını JSON formatına dönüştür
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      console.log("Excel'den elde edilen JSON:", jsonData);
      // JSON verisini jsonEditor textarea'sına aktar
      document.getElementById('jsonEditor').value = JSON.stringify(jsonData, null, 2);
    };
    reader.readAsArrayBuffer(file);
  });
  // Durum çubuğunu güncelleyen merkezi fonksiyon
function updateStatus(message, duration = 3000) {
  const statusInfo = document.querySelector('.status-info');
  if (!statusInfo) return;
  
  statusInfo.innerHTML = message;
  
  if (message !== '<i class="fas fa-check-circle"></i> Hazır') {
    setTimeout(() => {
      statusInfo.innerHTML = '<i class="fas fa-check-circle"></i> Hazır';
    }, duration);
  }
}
  
  // Sekme değiştirme
  jsonTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      // Aktif sekmeyi değiştir
      jsonTabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      // İlgili içeriği göster
      const tabId = this.getAttribute('data-tab');
      jsonTabContents.forEach(content => {
        content.classList.remove('active');
      });
      document.getElementById(tabId + '-tab').classList.add('active');
      
      // Form sekmesine geçildiğinde JSON verisini form alanlarına doldur
      if (tabId === 'form') {
        updateFormFromJson();
      }
    });
  });
  
  // Form işlemleri
  addItemBtn.addEventListener('click', addJsonItem);
  updateJsonBtn.addEventListener('click', updateJsonFromForm);
  
  // JSON verisi
  let jsonItems = [];
  
  function addJsonItem() {
    const text = itemTextInput.value.trim();
    const level = parseInt(itemLevelSelect.value);
    const id = itemIdInput.value.trim();
    const connectedTo = itemConnectedToSelect.value;
    
    if (!text) {
      alert("Lütfen görüntülenecek metni girin.");
      return;
    }
    
    if (!id) {
      alert("Lütfen benzersiz bir ID girin.");
      return;
    }
    
    // ID'nin benzersiz olduğunu kontrol et
    if (jsonItems.some(item => item.id === id)) {
      alert("Bu ID zaten kullanılıyor. Lütfen benzersiz bir ID girin.");
      return;
    }
    
    // Seviye 1 için bağlantı gereksiz
    const newItem = {
      text: text,
      level: level,
      id: id
    };
    
    // Eğer seviye 1 değilse ve bağlantı varsa
    if (level > 1 && connectedTo) {
      newItem.connectedTo = connectedTo;
    }
    
    // Öğeyi ekle
    jsonItems.push(newItem);
    
    // Formu temizle
    itemTextInput.value = "";
    itemIdInput.value = "";
    
    // Yeni öğeyi listede göster
    renderItemList();
    
    // Bağlantı dropdown'ını güncelle
    updateConnectedToOptions();
    
    // JSON'u güncelle
    updateJsonFromForm();
  }
  
  function renderItemList() {
    itemList.innerHTML = "";
    
    if (jsonItems.length === 0) {
      itemList.innerHTML = "<div class='json-item'>Henüz öğe eklenmemiş.</div>";
      return;
    }
    
    jsonItems.forEach((item, index) => {
      const itemElement = document.createElement('div');
      itemElement.className = 'json-item';
      
      const textSpan = document.createElement('span');
      textSpan.className = 'json-item-text';
      textSpan.textContent = `${item.text} (Seviye ${item.level}${item.connectedTo ? ', Bağlantı: ' + item.connectedTo : ''})`;
      
      const actions = document.createElement('div');
      actions.className = 'json-item-actions';
      
      const deleteBtn = document.createElement('button');
      deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
      deleteBtn.title = 'Sil';
      deleteBtn.addEventListener('click', () => {
        jsonItems.splice(index, 1);
        renderItemList();
        updateConnectedToOptions();
        updateJsonFromForm();
      });
      
      actions.appendChild(deleteBtn);
      itemElement.appendChild(textSpan);
      itemElement.appendChild(actions);
      
      itemList.appendChild(itemElement);
    });
  }
  
  function updateConnectedToOptions() {
    // Bağlantı seçeneklerini temizle
    while (itemConnectedToSelect.options.length > 1) {
      itemConnectedToSelect.remove(1);
    }
    
    // Tüm mevcut öğeleri ekle
    jsonItems.forEach(item => {
      const option = document.createElement('option');
      option.value = item.id;
      option.textContent = `${item.text} (${item.id})`;
      itemConnectedToSelect.appendChild(option);
    });
  }
  
  function updateJsonFromForm() {
    jsonEditor.value = JSON.stringify(jsonItems, null, 2);
  }
  
  function updateFormFromJson() {
    try {
      const data = JSON.parse(jsonEditor.value);
      jsonItems = data;
      renderItemList();
      updateConnectedToOptions();
    } catch (error) {
      console.error("JSON parse hatası:", error);
    }
  }
  
  function generateDiagramFromForm() {
    updateJsonFromForm();
    generateDiagramFromJson();
  }
  
  function saveJsonData() {
    try {
      // JSON editöründeki veriyi al
      const jsonData = jsonEditor.value;
      
      // Veriyi JSON olarak parse et (hata kontrolü için)
      JSON.parse(jsonData);
      
      // JSON verisini indirmek için blob oluştur
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Download linki oluştur ve tıkla
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = 'diagram-data.json';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // URL'i temizle
      URL.revokeObjectURL(url);
      
      const statusInfo = document.querySelector('.status-info');
      statusInfo.innerHTML = '<i class="fas fa-check-circle"></i> JSON verisi başarıyla kaydedildi.';
      setTimeout(() => {
        statusInfo.innerHTML = '<i class="fas fa-check-circle"></i> Hazır';
      }, 3000);
    } catch (error) {
      alert("JSON verisi kaydedilirken bir hata oluştu: " + error.message);
      console.error("JSON Kaydetme Hatası:", error);
    }
  }
  
  function loadJsonData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const jsonContent = e.target.result;
        
        // JSON formatını kontrol et
        JSON.parse(jsonContent);
        
        // JSON verisini editöre yükle
        jsonEditor.value = jsonContent;
        
        // JSON verisini kullanarak diyagramı oluştur
        generateDiagramFromJson();
        
        // Form verilerini güncelle
        updateFormFromJson();
        
        // Dosya input değerini sıfırla ki aynı dosyayı tekrar yükleyebilsin
        jsonFileInput.value = "";
        
        const statusInfo = document.querySelector('.status-info');
        statusInfo.innerHTML = '<i class="fas fa-check-circle"></i> JSON verisi başarıyla yüklendi.';
        setTimeout(() => {
          statusInfo.innerHTML = '<i class="fas fa-check-circle"></i> Hazır';
        }, 3000);
      } catch (error) {
        alert("JSON verisi yüklenirken bir hata oluştu: " + error.message);
        console.error("JSON Yükleme Hatası:", error);
      }
    };
    reader.readAsText(file);
  }
  
function generateDiagramFromJson() {
  try {
    // Mevcut diyagramı temizle
    clearCanvas();
    
    // JSON verisi
    const jsonData = JSON.parse(jsonEditor.value);
    
    // Objeyi sıfırla
    for (const key in shapeRegistry) {
      delete shapeRegistry[key];
    }
    
    // Seviyelere göre grupla
    const levelGroups = {};
    const maxLevel = Math.max(...jsonData.map(item => item.level));
    
    jsonData.forEach(item => {
      const level = item.level;
      if (!levelGroups[level]) {
        levelGroups[level] = [];
      }
      levelGroups[level].push(item);
    });
    
    // Yatay ve dikey aralıkları ayarla
    const horizontalSpacing = gridSize * 12;
    const verticalSpacing = gridSize * 6;
    
    // Her seviyeyi işle
    for (let level = 1; level <= maxLevel; level++) {
      const items = levelGroups[level] || [];
      
      // Bu seviyedeki öğelerin bağlantılarını grupla
      const groupedItems = {};
      items.forEach(item => {
        const parentId = item.connectedTo || 'root';
        if (!groupedItems[parentId]) {
          groupedItems[parentId] = [];
        }
        groupedItems[parentId].push(item);
      });
      
      // Her gruplandırılmış üst için düzen hesapla
      Object.keys(groupedItems).forEach(parentId => {
        const parentGroup = groupedItems[parentId];
        
        // Toplam genişlik hesapla
        let totalWidth = parentGroup.length * 160 + (parentGroup.length - 1) * horizontalSpacing;
        const startX = Math.max(gridSize, (canvas.clientWidth - totalWidth) / 2);
        
        // Grubu yerleştir
        parentGroup.forEach((item, index) => {
          const x = startX + index * (160 + horizontalSpacing);
          const y = level * verticalSpacing;
          
          const shape = createJsonShape('rectangle', x, y, item);
          shapeRegistry[item.id] = shape;
          
          // Bağlantı çizgisi ekle
          if (parentId !== 'root') {
            const parentShape = shapeRegistry[parentId];
            if (parentShape) {
              // Alt çalışanı olan üst başlıklar için özel kontrol
              const hasBottomChildren = jsonData.some(
                child => child.connectedTo === item.id && child.level > level
              );
              
              // 2. seviye için orthogonal, 3. seviye için urgotonal
              if (level === 2) {
                // Ana başlığa orthogonal çizgi
                createOrthogonalLine(parentShape, shape);
              }
            }
          }
        });
      });
      
      // 3. seviyedeki (Ekip Üyeleri) elemanları özel olarak düzenle
      if (level === 3) {
        const groupedByParent = {};
        items.forEach(item => {
          if (item.connectedTo && shapeRegistry[item.connectedTo]) {
            if (!groupedByParent[item.connectedTo]) {
              groupedByParent[item.connectedTo] = [];
            }
            groupedByParent[item.connectedTo].push(item);
          }
        });
        
        // Her üst eleman için alt elemanları düzenle
        Object.keys(groupedByParent).forEach(parentId => {
          const parentShape = shapeRegistry[parentId];
          const childItems = groupedByParent[parentId];
          
          // Üst şeklin sağ tarafında bir kolon oluştur
          const columnX = parseInt(parentShape.style.left) + parseInt(parentShape.offsetWidth) + gridSize * 4;
          
          // Eğer aynı üste bağlı alt çalışanlar varsa
          if (childItems.length > 0) {
            // Alt alta elemanları yerleştir
            childItems.forEach((item, index) => {
              const y = (3 * verticalSpacing) + index * (100 + gridSize * 2);
              const shape = createJsonShape('rectangle', columnX, y, item);
              shapeRegistry[item.id] = shape;
              
              // Urgotonal çizgi ile bağla
              createUrgotonalLines(parentShape, shape);
            });
          }
        });
      }
    }
    
    updateShapeCount();
    updateStatus('<i class="fas fa-check-circle"></i> Diyagram başarıyla oluşturuldu.');
  } catch (error) {
    alert('JSON verisinde hata var: ' + error.message);
    console.error('JSON Hata:', error);
  }
}
  function createSpecialUrgotonalLine(fromShape, toShape) {
    const horiz = document.createElement('div');
    horiz.className = 'urgo-line';

    canvas.insertBefore(horiz, canvas.firstChild)

    const fromRect = fromShape.getBoundingClientRect();
    const toRect = toShape.getBoundingClientRect();
    
    const fromX = fromShape.offsetLeft + fromShape.offsetWidth;
    const fromY = fromShape.offsetTop + fromShape.offsetHeight / 2;
    const toX = toShape.offsetLeft;
    const toY = toShape.offsetTop + toShape.offsetHeight / 2;
    // Dikey çizgiyi oluştur (fromShape'in sağından to shape'in sağına)
    horiz.style.left = `${fromX}px`;
    horiz.style.top = `${toY - 1}px`; // 1 piksel yukarı çekerek ortalama
    horiz.style.width = `${toX - fromX}px`;
    horiz.style.height = `2px`;

       // Çizgi nesnesini diziye ekle ve takip et
       const urgoLineObj = { 
        from: fromShape, 
        to: toShape, 
        horizontal: horiz,
        isSpecial: true
      };
      
      urgoLines.push(urgoLineObj);
      
      return urgoLineObj;
  }
  
  // Özel ortogonal bağlantı oluştur - sadece yatay ve dikey hatlardan oluşan
  function createSpecialOrthogonalLine(fromShape, toShape) {
    // Yatay çizgi için bir element oluştur
    const horiz = document.createElement('div');
    horiz.className = 'ortho-line';
    
    canvas.insertBefore(horiz, canvas.firstChild);
    
    // Şekillerin pozisyonlarını hesapla
    const fromRect = fromShape.getBoundingClientRect();
    const toRect = toShape.getBoundingClientRect();
    
    const fromX = fromShape.offsetLeft + fromShape.offsetWidth;
    const fromY = fromShape.offsetTop + fromShape.offsetHeight / 2;
    const toX = toShape.offsetLeft;
    const toY = toShape.offsetTop + toShape.offsetHeight / 2;
    
    // Yatay çizgiyi oluştur (fromShape'in sağından toShape'in soluna)
    horiz.style.left = `${fromX}px`;
    horiz.style.top = `${toY - 1}px`; // 1 piksel yukarı çekerek ortalama
    horiz.style.width = `${toX - fromX}px`;
    horiz.style.height = `2px`;
    
    // Çizgi nesnesini diziye ekle ve takip et
    const orthLineObj = { 
      from: fromShape, 
      to: toShape, 
      horizontal: horiz,
      isSpecial: true
    };
    
    orthoLines.push(orthLineObj);
    
    return orthLineObj;
  }
  
  function createJsonShape(type, x, y, item) {
    const shape = document.createElement('div');
    shape.className = `shape json-rectangle`;
    shape.id = `shape-${shapeCounter++}`;
    shape.dataset.jsonId = item.id;
    
    // Get color from input or use default
    const shapeColor = shapeColorInput.value;
    
    if (type === 'triangle') {
      shape.style.borderBottom = `100px solid ${shapeColor}`;
    } else {
      shape.style.backgroundColor = shapeColor;
    }
    
    shape.style.left = `${x}px`;
    shape.style.top = `${y}px`;
    
    // Olay dinleyicileri ekle
    setupShapeEventListeners(shape);
    
    canvas.appendChild(shape);
    
    // Metni ekle
    if (item.text) {
      const textElem = document.createElement('div');
      textElem.className = 'shape-text';
      textElem.textContent = item.text;
      shape.appendChild(textElem);
    }
    
    return shape;
  }

  // Çizgi modları
  lineBtn.addEventListener('click', function() {
    // Disable paint brush mode
    paintBrushMode = false;
    paintBrushBtn.classList.remove('active');
    canvas.style.cursor = "default";
    urgoLineMode = false;
    urgoLineBtn.classList.remove('active');
    orthoLineMode = false;
    orthoLineBtn.classList.remove('active');
    lineMode = !lineMode;
    this.classList.toggle('active', lineMode);
    if (!lineMode && lineStart) {
      lineStart.classList.remove('line-start');
      lineStart = null;
    }
  });

  orthoLineBtn.addEventListener('click', function() {
    // Disable paint brush mode
    paintBrushMode = false;
    paintBrushBtn.classList.remove('active');
    canvas.style.cursor = "default";
    
    lineMode = false;
    lineBtn.classList.remove('active');
    orthoLineMode = !orthoLineMode;
    this.classList.toggle('active', orthoLineMode);
    if (!orthoLineMode && orthoLineStart) {
      orthoLineStart.classList.remove('line-start');
      orthoLineStart = null;
    }

  });

  urgoLineBtn.addEventListener('click', function() {
    // Tüm modları devre dışı bırak
    paintBrushMode = false;
    paintBrushBtn.classList.remove('active');
    
    lineMode = false;
    lineBtn.classList.remove('active');
    if (lineStart) {
      lineStart.classList.remove('line-start');
      lineStart = null;
    }
    
    orthoLineMode = false;
    orthoLineBtn.classList.remove('active');
    if (orthoLineStart) {
      orthoLineStart.classList.remove('line-start');
      orthoLineStart = null;
    }
    
    // URGO modu toggle'la (ters çevir)
    urgoLineMode = !urgoLineMode;
    this.classList.toggle('active', urgoLineMode);
    
    // Eğer URGO modu kapatıldıysa başlangıç noktasını temizle
    if (!urgoLineMode && urgoLineStart) {
      urgoLineStart.classList.remove('line-start');
      urgoLineStart = null;
    }
    
    // Kullanıcıya bilgi ver
    const statusInfo = document.querySelector('.status-info');
    if (urgoLineMode) {
      statusInfo.innerHTML = '<i class="fas fa-exchange-alt"></i> URGO çizgi modu aktif';
      canvas.style.cursor = "crosshair"; // İmleç değiştir
    } else {
      statusInfo.innerHTML = '<i class="fas fa-check-circle"></i> Hazır';
      canvas.style.cursor = "default";
    }
  });

  downloadBtn.addEventListener('click', function() {
    // Grid arka planını geçici olarak kaldır
    const oldBgImage = canvas.style.backgroundImage;
    const oldBgColor = canvas.style.backgroundColor;
    const oldOverflow = canvas.style.overflow;
    const oldHeight = canvas.style.height;
    const oldPosition = canvas.style.position;
    
    // Canvas'ın tüm içeriği göstermesi için ayarla
    canvas.style.backgroundImage = 'none';
    canvas.style.backgroundColor = "#ffffff";
    canvas.style.overflow = 'visible';
    canvas.style.height = 'auto';
    
    // Kullanıcıya bilgi ver
    const statusInfo = document.querySelector('.status-info');
    statusInfo.innerHTML = '<i class="fas fa-spinner fa-spin"></i> PNG hazırlanıyor...';
    
    // Tüm elemanların konumları hesapla
    let maxBottom = 0;
    document.querySelectorAll('.shape').forEach(shape => {
      const bottom = shape.offsetTop + shape.offsetHeight;
      if (bottom > maxBottom) maxBottom = bottom;
    });
    
    // Canvas'ı geçici olarak büyüt
    canvas.style.height = (maxBottom + 100) + 'px';
    
    // Yüksek kalite için scale parametresi ekledik (2x daha yüksek çözünürlük)
    html2canvas(canvas, { 
      backgroundColor: "#ffffff",
      scale: 2, // Daha yüksek çözünürlük
      useCORS: true,
      logging: false,
      allowTaint: true,
      windowHeight: maxBottom + 200,
      height: maxBottom + 100,
      scrollY: -window.scrollY, // Scroll pozisyonunu düzelt
      onclone: function(clonedDoc) {
        // Klonlanmış canvas'ın tam boyuta sahip olduğundan emin ol
        const clonedCanvas = clonedDoc.querySelector('#canvas');
        if (clonedCanvas) {
          clonedCanvas.style.height = (maxBottom + 100) + 'px';
        }
      }
    }).then(function(capturedCanvas) {
      // PNG formatı kullan (daha iyi kalite)
      const dataURL = capturedCanvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = "diagram.png";
      link.click();
      
      // Arka planı eski haline getir
      canvas.style.backgroundImage = oldBgImage;
      canvas.style.backgroundColor = oldBgColor;
      canvas.style.overflow = oldOverflow;
      canvas.style.height = oldHeight;
      canvas.style.position = oldPosition;
      
      statusInfo.innerHTML = '<i class="fas fa-check-circle"></i> PNG başarıyla kaydedildi.';
      setTimeout(() => {
        statusInfo.innerHTML = '<i class="fas fa-check-circle"></i> Hazır';
      }, 3000);
    }).catch(error => {
      console.error('PNG kaydetme hatası:', error);
      statusInfo.innerHTML = '<i class="fas fa-exclamation-circle"></i> PNG kaydedilemedi.';
      setTimeout(() => {
        statusInfo.innerHTML = '<i class="fas fa-check-circle"></i> Hazır';
      }, 3000);
    });
  });
  
  // Tüm şekilleri temizle
  clearBtn.addEventListener('click', clearCanvas);
  
  function clearCanvas() {
    while (canvas.firstChild) {
      canvas.removeChild(canvas.firstChild);
    }
    lines.length = 0;
    orthoLines.length = 0;
    urgoLines.length = 0;
    selectedShape = null;
    updateShapeCount();
    
    const statusInfo = document.querySelector('.status-info');
    statusInfo.innerHTML = '<i class="fas fa-check-circle"></i> Tüm şekiller temizlendi.';
    setTimeout(() => {
      statusInfo.innerHTML = '<i class="fas fa-check-circle"></i> Hazır';
    }, 3000);
  }

  // Canvas boş alana tıklandığında seçimi kaldır
  canvas.addEventListener('click', function(e) {
    if (e.target === canvas && selectedShape) {
      deselectShape(selectedShape);
      selectedShape = null;
    }
  });

  // Delete tuşuyla silme
  document.addEventListener('keydown', function(e) {
    if (e.key === "Delete" && !e.target.matches('input, textarea')) {
      deleteSelectedShape();
    }
  });

  function deleteSelectedShape() {
    if (selectedShape) {
      removeConnectedLines(selectedShape);
      removeOrthogonalLines(selectedShape);
      removeUrgotonalLines(selectedShape);
      // shapeRegistry'den kaldır
      if (selectedShape.dataset.jsonId) {
        delete shapeRegistry[selectedShape.dataset.jsonId];
      }
      canvas.removeChild(selectedShape);
      selectedShape = null;
      updateShapeCount();
      
      const statusInfo = document.querySelector('.status-info');
      statusInfo.innerHTML = '<i class="fas fa-check-circle"></i> Şekil silindi.';
      setTimeout(() => {
        statusInfo.innerHTML = '<i class="fas fa-check-circle"></i> Hazır';
      }, 2000);
    }
  }

  // Ctrl+C ile kopyalama
  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key.toLowerCase() === "c" && !e.target.matches('input, textarea')) {
      if (selectedShape) copyShape(selectedShape);
    }
  });

  function createShape(type) {
    const shape = document.createElement('div');
    shape.className = `shape ${type}`;
    shape.id = `shape-${shapeCounter++}`;
    
    // Get color from input
    const shapeColor = shapeColorInput.value;
    
    // Şekil tipine göre stil uygula
    if (type === 'triangle') {
      // Üçgen için özel stil
      shape.style.width = '0';
      shape.style.height = '0';
      shape.style.borderLeft = '50px solid transparent';
      shape.style.borderRight = '50px solid transparent';
      shape.style.borderBottom = `100px solid ${shapeColor}`;
    } else if (type === 'circle') {
      // Çember için özel stil
      shape.style.width = '100px';
      shape.style.height = '100px';
      shape.style.borderRadius = '50%';
      shape.style.backgroundColor = shapeColor;
    } else {
      // Kare ve dikdörtgen için normal stil
      shape.style.backgroundColor = shapeColor;
      
      if (type === 'rectangle') {
        shape.style.width = '150px';
        shape.style.height = '100px';
      } else if (type === 'square') {
        shape.style.width = '100px';
        shape.style.height = '100px';
      }
    }
    
    const left = Math.round((Math.random() * (canvas.clientWidth - 100) + 50) / gridSize) * gridSize;
    const top = Math.round((Math.random() * (canvas.clientHeight - 100) + 50) / gridSize) * gridSize;
    shape.style.left = `${left}px`;
    shape.style.top = `${top}px`;
    
    // Olay dinleyicileri
    shape.addEventListener('mousedown', startDrag);
    shape.addEventListener('dblclick', function(e) {
      e.stopPropagation();
      openTextEditor(shape);
    });
    shape.addEventListener('click', function(e) {
      e.stopPropagation();
      
      if (paintBrushMode) {
        // Apply current color
        applyColorToShape(shape, shapeColorInput.value);
        return;
      }
      
      if (lineMode) {
        if (!lineStart) {
          lineStart = shape;
          shape.classList.add('line-start');
        } else {
          if (shape === lineStart) return;
          createLine(lineStart, shape);
          lineStart.classList.remove('line-start');
          lineStart = null;
          lineMode = false;
          lineBtn.classList.remove('active');
        }
      } else if (orthoLineMode) {
        if (!orthoLineStart) {
          orthoLineStart = shape;
          shape.classList.add('line-start');
        } else {
          if (shape === orthoLineStart) return;
          createOrthogonalLine(orthoLineStart, shape);
          orthoLineStart.classList.remove('line-start');
          orthoLineStart = null;
          orthoLineMode = false;
          orthoLineBtn.classList.remove('active');
        }
      }else if (urgoLineMode) {
        if (!urgoLineStart) {
          urgoLineStart = shape;
          shape.classList.add('line-start');
        } else {
          if (shape === urgoLineStart) return;
          createUrgotonalLines(urgoLineStart, shape);
          urgoLineStart.classList.remove('line-start');
          urgoLineStart = null;
          urgoLineMode = false;
          urgoLineBtn.classList.remove('active');
        }
      } else {
        selectShape(shape);
      }
    });
    
    canvas.appendChild(shape);
    if (!lineMode && !orthoLineMode  && !urgoLineMode) selectShape(shape);
    updateShapeCount();
  }


  function selectShape(shape) {
    if (selectedShape && selectedShape !== shape) {
      deselectShape(selectedShape);
    }
    selectedShape = shape;
    shape.classList.add('selected');
    addResizeHandle(shape);
    updateTextControls();
  }

  function deselectShape(shape) {
    shape.classList.remove('selected');
    removeResizeHandle(shape);
  }

  function startDrag(e) {
    if (isResizing) return;
    if (lineMode || orthoLineMode || paintBrushMode || urgoLineMode) return;
    e.preventDefault();
    selectShape(this);
    const rect = this.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    document.addEventListener('mousemove', dragShape);
    document.addEventListener('mouseup', stopDrag);
  }

  function dragShape(e) {
    if (!selectedShape) return;
    const canvasRect = canvas.getBoundingClientRect();
    let x = e.clientX - offsetX - canvasRect.left;
    let y = e.clientY - offsetY - canvasRect.top;
    x = Math.round(x / gridSize) * gridSize;
    y = Math.round(y / gridSize) * gridSize;
    selectedShape.style.left = `${x}px`;
    selectedShape.style.top = `${y}px`;
    updateConnectedLines(selectedShape);
    updateOrthogonalLines(selectedShape);
    updateUrgotonalLines(selectedShape);
  }

  function stopDrag() {
    document.removeEventListener('mousemove', dragShape);
    document.removeEventListener('mouseup', stopDrag);
  }

  deleteBtn.addEventListener('click', deleteSelectedShape);

  function updateShapeCount() {
    shapeCount.textContent = document.querySelectorAll('.shape').length;
  }

 

  function createLine(fromShape, toShape) {
    const line = document.createElement('div');
    line.className = 'line';
    canvas.insertBefore(line, canvas.firstChild);
    const lineObj = { from: fromShape, to: toShape, element: line };
    lines.push(lineObj);
    updateLinePosition(lineObj);
  }

  function updateLinePosition(lineObj) {
    const from = lineObj.from;
    const to = lineObj.to;
    const x1 = from.offsetLeft + from.offsetWidth / 2;
    const y1 = from.offsetTop + from.offsetHeight / 2;
    const x2 = to.offsetLeft + to.offsetWidth / 2;
    const y2 = to.offsetTop + to.offsetHeight / 2;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    lineObj.element.style.left = `${x1}px`;
    lineObj.element.style.top = `${y1}px`;
    lineObj.element.style.width = `${length}px`;
    lineObj.element.style.transform = `rotate(${angle}deg)`;
  }

  // removeConnectedLines fonksiyonu: Seçili şekle bağlı çizgileri kaldırır.
  function removeConnectedLines(shape) {
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].from === shape || lines[i].to === shape) {
        lines[i].element.remove();
        lines.splice(i, 1);
      }
    }
  }

  function updateConnectedLines(shape) {
    lines.forEach(lineObj => {
      if (lineObj.from === shape || lineObj.to === shape) {
        updateLinePosition(lineObj);
      }
    });
  }
  function createUrgotonalLines(fromShape, toShape) {
    // Tüm eski çizgileri temizle
    const horiz1 = document.createElement('div');
    const vert = document.createElement('div');
    const horiz2 = document.createElement('div');
    
    horiz1.className = 'urgo-line';
    vert.className = 'urgo-line';
    horiz2.className = 'urgo-line';
    
    // CSS'de görebilmek için belirgin renkler verilebilir
    horiz1.style.backgroundColor = '#000000'; //Siyah
    vert.style.backgroundColor = '#000000';   // Siyah
    horiz2.style.backgroundColor = '#000000'; // Siyah
    
    canvas.insertBefore(horiz1, canvas.firstChild);
    canvas.insertBefore(vert, canvas.firstChild);
    canvas.insertBefore(horiz2, canvas.firstChild);
    
    const urgoLineObj = { 
      from: fromShape, 
      to: toShape, 
      horiz1: horiz1,
      vert: vert,
      horiz2: horiz2
    };
    
    urgoLines.push(urgoLineObj);
    updateUrgotonalLinePosition(urgoLineObj);
    
    return urgoLineObj;
  }
  
  function updateUrgotonalLinePosition(urgoLineObj) {
    const from = urgoLineObj.from;
    const to = urgoLineObj.to;
    
    // Başlangıç koordinatları (fromShape'in sağ orta noktası)
    const fromX = from.offsetLeft + from.offsetWidth;
    const fromY = from.offsetTop + from.offsetHeight / 2;
    
    // Hedef koordinatları (toShape'in sol orta noktası)
    const toX = to.offsetLeft;
    const toY = to.offsetTop + to.offsetHeight / 2;
    
    // Merkez nokta (toShape'in merkezi)
    const toCenterX = to.offsetLeft + to.offsetWidth / 2;
    
    // Kısa yatay çizgi mesafesi
    const offsetX = 20; // Bu değeri artırıp azaltabilirsiniz
    
    // 1. Çizgi: Başlangıç şeklinden sağa doğru kısa çizgi
    urgoLineObj.horiz1.style.left = `${fromX}px`;
    urgoLineObj.horiz1.style.top = `${fromY - 1}px`; // Ortalamak için -1
    urgoLineObj.horiz1.style.width = `${offsetX}px`;
    urgoLineObj.horiz1.style.height = `2px`;
    
    // 2. Çizgi: Dikey çizgi
    const verticalX = fromX + offsetX;
    urgoLineObj.vert.style.left = `${verticalX - 1}px`; // Ortalamak için -1
    urgoLineObj.vert.style.top = `${Math.min(fromY, toY)}px`;
    urgoLineObj.vert.style.width = `2px`;
    urgoLineObj.vert.style.height = `${Math.abs(toY - fromY)}px`;
    
    // 3. Çizgi: toShape'in merkezine doğru yatay çizgi
    urgoLineObj.horiz2.style.left = `${Math.min(verticalX, toCenterX)}px`;
    urgoLineObj.horiz2.style.top = `${toY - 1}px`; // Ortalamak için -1
    urgoLineObj.horiz2.style.width = `${Math.abs(toCenterX - verticalX)}px`;
    urgoLineObj.horiz2.style.height = `2px`;
  }
  
  function removeUrgotonalLines(shape) {
    for (let i = urgoLines.length - 1; i >= 0; i--) {
      if (urgoLines[i].from === shape || urgoLines[i].to === shape) {
        urgoLines[i].horiz1.remove();
        urgoLines[i].vert.remove();
        urgoLines[i].horiz2.remove();
        urgoLines.splice(i, 1);
      }
    }
  }

  function updateUrgotonalLines(shape) {
    urgoLines.forEach(urgoLineObj => {
      if (urgoLineObj.from === shape || urgoLineObj.to === shape) {
        updateUrgotonalLinePosition(urgoLineObj);
      }
    });
  }

  function removeUrgotonalLines(shape) {
    for (let i = urgoLines.length - 1; i >= 0; i--) {
      if (urgoLines[i].from === shape || urgoLines[i].to === shape) {
        urgoLines[i].horiz1.remove();
        urgoLines[i].vert.remove();
        urgoLines[i].horiz2.remove();
        urgoLines.splice(i, 1);
      }
    }
  }

  function createOrthogonalLine(fromShape, toShape) {
    const horiz = document.createElement('div');
    horiz.className = 'ortho-line';
    const vert = document.createElement('div');
    vert.className = 'ortho-line';
    const vert2 = document.createElement('div');
    vert2.className = 'ortho-line';
    
    canvas.insertBefore(horiz, canvas.firstChild);
    canvas.insertBefore(vert, canvas.firstChild);
    canvas.insertBefore(vert2, canvas.firstChild);
    
    const orthoLineObj = { 
      from: fromShape, 
      to: toShape, 
      horizontal: horiz, 
      vertical: vert,
      vertical2: vert2
    };
    
    orthoLines.push(orthoLineObj);
    updateOrthogonalLinePosition(orthoLineObj);
  }

  function updateOrthogonalLinePosition(orthoLineObj) {
    // Eğer özel çizgiyse
    if (orthoLineObj.isSpecial) {
      const from = orthoLineObj.from;
      const to = orthoLineObj.to;
      
      const fromX = from.offsetLeft + from.offsetWidth;
      const fromY = from.offsetTop + from.offsetHeight / 2;
      const toX = to.offsetLeft;
      const toY = to.offsetTop + to.offsetHeight / 2;
      
      // Yatay çizgiyi güncelle
      orthoLineObj.horizontal.style.left = `${fromX}px`;
      orthoLineObj.horizontal.style.top = `${toY - 1}px`;
      orthoLineObj.horizontal.style.width = `${toX - fromX}px`;
      orthoLineObj.horizontal.style.height = `2px`;
      
      return;
    }
    
    // Normal ortogonal çizgiler için eski kodu kullan
    const from = orthoLineObj.from;
    const to = orthoLineObj.to;
    const x1 = from.offsetLeft + from.offsetWidth / 2;
    const y1 = from.offsetTop + from.offsetHeight / 2;
    const x2 = to.offsetLeft + to.offsetWidth / 2;
    const y2 = to.offsetTop + to.offsetHeight / 2;
    
    // Dikey çizgi önce yarı yola kadar gider
    const midY = (y1 + y2) / 2;
    
    // Y ekseninde önce ortaya gider
    orthoLineObj.vertical.style.left = `${x1 - 1}px`;
    orthoLineObj.vertical.style.top = `${Math.min(y1, midY)}px`;
    orthoLineObj.vertical.style.width = `2px`;
    orthoLineObj.vertical.style.height = `${Math.abs(midY - y1)}px`;
    
    // X ekseninde yatay çizgi
    orthoLineObj.horizontal.style.left = `${Math.min(x1, x2)}px`;
    orthoLineObj.horizontal.style.top = `${midY - 1}px`;
    orthoLineObj.horizontal.style.width = `${Math.abs(x2 - x1)}px`;
    orthoLineObj.horizontal.style.height = `2px`;
    
    // İkinci dikey çizgi
    if (orthoLineObj.vertical2) {
      orthoLineObj.vertical2.style.left = `${x2 - 1}px`;
      orthoLineObj.vertical2.style.top = `${Math.min(midY, y2)}px`;
      orthoLineObj.vertical2.style.width = `2px`;
      orthoLineObj.vertical2.style.height = `${Math.abs(y2 - midY)}px`;
    }
  }

  function updateOrthogonalLines(shape) {
    orthoLines.forEach(orthoLineObj => {
      if (orthoLineObj.from === shape || orthoLineObj.to === shape) {
        updateOrthogonalLinePosition(orthoLineObj);
      }
    });
  }

  function removeOrthogonalLines(shape) {
    for (let i = orthoLines.length - 1; i >= 0; i--) {
      if (orthoLines[i].from === shape || orthoLines[i].to === shape) {
        // Özel çizgi mi kontrol et
        if (orthoLines[i].isSpecial) {
          orthoLines[i].horizontal.remove();
        } else {
          orthoLines[i].horizontal.remove();
          orthoLines[i].vertical.remove();
          if (orthoLines[i].vertical2) {
            orthoLines[i].vertical2.remove();
          }
        }
        orthoLines.splice(i, 1);
      }
    }
  }

  // Text editörü: Her zaman textarea; Enter (Shift olmadan) ile kaydeder.
  // Blur olayında, odak text kontrol paneline geçiyorsa kaydetmez.
  function openTextEditor(shape) {
    if (shape.querySelector('.text-editor')) return;
    const currentTextElem = shape.querySelector('.shape-text');
    const currentText = currentTextElem ? currentTextElem.textContent : "";
    const editor = document.createElement('textarea');
    editor.className = 'text-editor';
    editor.value = currentText;
    editor.rows = 1;
    editor.addEventListener('keydown', function(e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        saveText();
      }
    });
    editor.addEventListener('mousedown', function(e) { e.stopPropagation(); });
    editor.addEventListener('blur', function(e) {
      if (e.relatedTarget && e.relatedTarget.closest('#text-controls')) return;
      saveText();
    });
    function saveText() {
      const oldText = shape.querySelector('.shape-text');
      if (oldText) oldText.remove();
      const text = editor.value.trim();
      if (text) {
        const textElem = document.createElement('div');
        textElem.className = 'shape-text';
        textElem.textContent = text;
        textElem.style.fontSize = fontSizeSelect.value + "px";
        textElem.style.fontWeight = boldToggle.checked ? "bold" : "normal";
        textElem.style.fontStyle = italicToggle.checked ? "italic" : "normal";
        textElem.style.fontFamily = fontFamilySelect.value;
        textElem.style.color = textColorPicker.value;
        shape.appendChild(textElem);
      }
      editor.remove();
    }
    shape.appendChild(editor);
    editor.focus();
  }

  // Ctrl+C kopyalama
  function copyShape(shape) {
    const newShape = shape.cloneNode(true);
    newShape.id = `shape-${shapeCounter++}`;
    const currentLeft = parseInt(shape.style.left);
    const currentTop = parseInt(shape.style.top);
    newShape.style.left = (currentLeft + 20) + "px";
    newShape.style.top = (currentTop + 20) + "px";
    newShape.classList.remove("selected", "line-start");
    newShape.addEventListener('mousedown', startDrag);
    newShape.addEventListener('dblclick', function(e) {
      e.stopPropagation();
      openTextEditor(newShape);
    });
    newShape.addEventListener('click', function(e) {
      e.stopPropagation();
      
      if (paintBrushMode) {
        // Apply current color
        applyColorToShape(newShape, shapeColorInput.value);
        return;
      }
      
      if (lineMode) {
        if (!lineStart) {
          lineStart = newShape;
          newShape.classList.add('line-start');
        } else {
          if (newShape === lineStart) return;
          createLine(lineStart, newShape);
          lineStart.classList.remove('line-start');
          lineStart = null;
          lineMode = false;
          lineBtn.classList.remove('active');
        }
      } else if (orthoLineMode) {
        if (!orthoLineStart) {
          orthoLineStart = newShape;
          newShape.classList.add('line-start');
        } else {
          if (newShape === orthoLineStart) return;
          createOrthogonalLine(orthoLineStart, newShape);
          orthoLineStart.classList.remove('line-start');
          orthoLineStart = null;
          orthoLineMode = false;
          orthoLineBtn.classList.remove('active');
        }
      }else if (urgoLineMode) {
        if (!urgoLineStart) {
          urgoLineStart = newShape;
          newShape.classList.add('line-start');
        } else {
          if (newShape === urgoLineStart) return;
          createUrgotonalLines(urgoLineStart, newShape);
          urgoLineStart.classList.remove('line-start');
          urgoLineStart = null;
          urgoLineMode = false;
          urgoLineBtn.classList.remove('active');
        }
      } else {
        selectShape(newShape);
      }
    });
    canvas.appendChild(newShape);
    updateShapeCount();
  }

  // Panel kontrolü: Seçili şeklin text özelliklerini güncelle
 

  function rgbToHex(rgb) {
    const result = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/.exec(rgb);
    return result ? "#" +
      ("0" + parseInt(result[1], 10).toString(16)).slice(-2) +
      ("0" + parseInt(result[2], 10).toString(16)).slice(-2) +
      ("0" + parseInt(result[3], 10).toString(16)).slice(-2) : rgb;
  }

  fontSizeSelect.addEventListener('change', function() {
    if (selectedShape) {
      const textElem = selectedShape.querySelector('.shape-text');
      if (textElem) { textElem.style.fontSize = this.value + "px"; }
    }
  });
  boldToggle.addEventListener('change', function() {
    if (selectedShape) {
      const textElem = selectedShape.querySelector('.shape-text');
      if (textElem) { textElem.style.fontWeight = this.checked ? "bold" : "normal"; }
    }
  });
  italicToggle.addEventListener('change', function() {
    if (selectedShape) {
      const textElem = selectedShape.querySelector('.shape-text');
      if (textElem) { textElem.style.fontStyle = this.checked ? "italic" : "normal"; }
    }
  });
  fontFamilySelect.addEventListener('change', function() {
    if (selectedShape) {
      const textElem = selectedShape.querySelector('.shape-text');
      if (textElem) { textElem.style.fontFamily = this.value; }
    }
  });

});
// Bu script bloğunu HTML dosyanızın en altına ekleyin


  // Excel yükle butonuna tıklanınca gizli dosya inputunu tetikle
  document.getElementById('excelUploadBtn').addEventListener('click', function() {
    document.getElementById('excelInput').click();
  });

  // Dosya seçildiğinde, Excel'i oku ve JSON formatına çevir
  document.getElementById('excelInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      // İlk çalışma sayfasını seçiyoruz
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      // Çalışma sayfasını JSON formatına dönüştür
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      console.log("Excel'den elde edilen JSON:", jsonData);
      // JSON verisini jsonEditor textarea'sına aktar
      document.getElementById('jsonEditor').value = JSON.stringify(jsonData, null, 2);
    };
    reader.readAsArrayBuffer(file);
  });


  // Bu tamamen yeni bir script - HTML dosyanızın sonuna ekleyin
// ve önceki richTextEditor scriptlerini kaldırın
document.addEventListener('DOMContentLoaded', function() {
  // Zengin metin düzenleyiciyi açan fonksiyon
  window.openRichTextEditor = function(shape) {
    // Eğer zaten bir editör açıksa kapat
    const existingEditor = document.querySelector('.rich-text-editor-container');
    if (existingEditor) {
      existingEditor.remove();
    }

    // Mevcut içeriği al (HTML olarak)
    const currentTextElem = shape.querySelector('.shape-text');
    const currentHTML = currentTextElem ? currentTextElem.innerHTML : "";

    // Editör konteynerini oluştur
    const editorContainer = document.createElement('div');
    editorContainer.className = 'rich-text-editor-container';
    editorContainer.style.zIndex = '2000'; // Yüksek z-index
    
    // Araç çubuğunu oluştur
    const toolbar = document.createElement('div');
    toolbar.className = 'rich-text-toolbar';
    toolbar.innerHTML = `
      <button type="button" data-command="bold" title="Kalın"><i class="fas fa-bold"></i></button>
      <button type="button" data-command="italic" title="İtalik"><i class="fas fa-italic"></i></button>
      <button type="button" data-command="underline" title="Altı Çizili"><i class="fas fa-underline"></i></button>
      <div class="toolbar-separator"></div>
      
      <button type="button" data-command="foreColor" data-value="#FF0000" title="Kırmızı"><i class="fas fa-font" style="color: #FF0000"></i></button>
      <button type="button" data-command="foreColor" data-value="#00FF00" title="Yeşil"><i class="fas fa-font" style="color: #00FF00"></i></button>
      <button type="button" data-command="foreColor" data-value="#0000FF" title="Mavi"><i class="fas fa-font" style="color: #0000FF"></i></button>
      <button type="button" data-command="foreColor" data-value="#000000" title="Siyah"><i class="fas fa-font" style="color: #000000"></i></button>
      <button type="button" data-command="foreColor" data-value="#FFFFFF" title="Beyaz"><i class="fas fa-font" style="color: #FFFFFF;text-shadow:0 0 1px black"></i></button>
      
      <div class="toolbar-separator"></div>
      <button type="button" data-command="justifyLeft" title="Sola Hizala"><i class="fas fa-align-left"></i></button>
      <button type="button" data-command="justifyCenter" title="Ortala"><i class="fas fa-align-center"></i></button>
      <button type="button" data-command="justifyRight" title="Sağa Hizala"><i class="fas fa-align-right"></i></button>
      <div class="toolbar-separator"></div>
      <button type="button" data-command="fontSize" data-value="1" title="Küçük Yazı"><i class="fas fa-text-height"></i><sub>S</sub></button>
      <button type="button" data-command="fontSize" data-value="3" title="Normal Yazı"><i class="fas fa-text-height"></i><sub>M</sub></button>
      <button type="button" data-command="fontSize" data-value="7" title="Büyük Yazı"><i class="fas fa-text-height"></i><sub>L</sub></button>
    `;
    
    // Özel renk seçicisini ekle
    const colorPickerContainer = document.createElement('div');
    colorPickerContainer.className = 'color-button-wrapper';
    colorPickerContainer.innerHTML = `
      <input type="color" id="customTextColorPicker" value="#000000" title="Özel Renk Seç">
    `;
    toolbar.appendChild(colorPickerContainer);
    
    // Düzenleyici içeriğini oluştur
    const editor = document.createElement('div');
    editor.className = 'rich-text-editor';
    editor.contentEditable = true;
    editor.innerHTML = currentHTML;
    
    // Buton konteynerini oluştur
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'editor-button-container';
    
    // Kaydet ve İptal butonlarını oluştur
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Kaydet';
    saveBtn.className = 'editor-btn save-btn';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'İptal';
    cancelBtn.className = 'editor-btn cancel-btn';
    
    // Butonları konteynere ekle
    buttonContainer.appendChild(saveBtn);
    buttonContainer.appendChild(cancelBtn);
    
    // Tüm bileşenleri ana konteynere ekle
    editorContainer.appendChild(toolbar);
    editorContainer.appendChild(editor);
    editorContainer.appendChild(buttonContainer);
    
    // Konteyneri canvas'a ekle
    document.querySelector('.canvas').appendChild(editorContainer);
    
    // Editörü şeklin yanına konumlandır
    positionEditor(editorContainer, shape);
    
    // Özel renk seçici olayını ekle
    const customColorPicker = editorContainer.querySelector('#customTextColorPicker');
    customColorPicker.addEventListener('input', function() {
      document.execCommand('foreColor', false, this.value);
      editor.focus();
    });
    
    // Araç çubuğu butonları için olay dinleyici
    toolbar.addEventListener('click', function(e) {
      e.stopPropagation();
      const button = e.target.closest('button');
      if (!button) return;
      
      const command = button.getAttribute('data-command');
      if (!command) return;
      
      const value = button.getAttribute('data-value');
      
      document.execCommand(command, false, value);
      editor.focus();
    });
    
    // Kaydet butonu olayı
    saveBtn.addEventListener('click', function() {
      saveContent();
    });
    
    // İptal butonu olayı
    cancelBtn.addEventListener('click', function() {
      editorContainer.remove();
    });
    
    // Klavye kısayolları
    editor.addEventListener('keydown', function(e) {
      // Escape tuşu
      if (e.key === 'Escape') {
        editorContainer.remove();
      }
      
      // Ctrl+Enter
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        saveContent();
      }
    });
    
    // Tıklama oayını engelle
    editor.addEventListener('mousedown', function(e) {
      e.stopPropagation();
    });
    
    // İçeriği kaydetme fonksiyonu
    function saveContent() {
      const content = editor.innerHTML.trim();
      
      // Eski metni kaldır
      const oldText = shape.querySelector('.shape-text');
      if (oldText) oldText.remove();
      
      // Yeni metin ekle
      if (content) {
        const textElem = document.createElement('div');
        textElem.className = 'shape-text';
        textElem.innerHTML = content;
        shape.appendChild(textElem);
      }
      
      // Editörü kaldır
      editorContainer.remove();
    }
    
    // Editörü odakla
    setTimeout(() => {
      editor.focus();
      // İmleci sona taşı
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(editor);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }, 10);
  };
  
  // Editörü konumlandır
  function positionEditor(editorContainer, shape) {
    const shapeRect = shape.getBoundingClientRect();
    const canvasRect = document.querySelector('.canvas').getBoundingClientRect();
    
    // Editör genişliği
    const editorWidth = Math.min(Math.max(shapeRect.width * 1.5, 350), 500);
    
    // Pozisyon hesapla
    let left = shapeRect.right - canvasRect.left + 10;
    let top = shapeRect.top - canvasRect.top;
    
    // Sağa taşıyorsa sola konumlandır
    if (left + editorWidth > canvasRect.width - 20) {
      left = shapeRect.left - canvasRect.left - editorWidth - 10;
    }
    
    // Sol kenara çok yakınsa, şeklin üstüne yerleştir
    if (left < 10) {
      left = Math.max(10, (shapeRect.left + shapeRect.right) / 2 - canvasRect.left - editorWidth / 2);
      top = shapeRect.top - canvasRect.top - editorContainer.offsetHeight - 10;
      
      // Üste sığmıyorsa alta yerleştir
      if (top < 10) {
        top = shapeRect.bottom - canvasRect.top + 10;
      }
    }
    
    // Stili ayarla
    editorContainer.style.position = 'absolute';
    editorContainer.style.left = `${left}px`;
    editorContainer.style.top = `${top}px`;
    editorContainer.style.width = `${editorWidth}px`;
  }
  
  // Çift tıklama olayını yakala
  document.addEventListener('dblclick', function(e) {
    const shape = e.target.closest('.shape');
    if (shape) {
      e.stopPropagation();
      window.openRichTextEditor(shape);
    }
  }, true);
  
  // Canvas'a tıklandığında editörü kapat
  document.querySelector('.canvas').addEventListener('mousedown', function(e) {
    if (!e.target.closest('.rich-text-editor-container') && !e.target.closest('.shape')) {
      const editor = document.querySelector('.rich-text-editor-container');
      if (editor) editor.remove();
    }
  });
});


  // Bu script bloğunu HTML dosyanızın en altına ekleyin
document.addEventListener('DOMContentLoaded', function() {
  // Renk seçici elemanları
  const colorPickerTrigger = document.getElementById('colorPickerTrigger');
  const colorPickerPopup = document.getElementById('colorPickerPopup');
  const currentColorSwatch = document.getElementById('currentColorSwatch');
  const customColorPicker = document.getElementById('customColorPicker');
  const shapeColorInput = document.getElementById('shapeColor');
  const themeColorsContainer = document.getElementById('themeColors');
  const standardColorsContainer = document.getElementById('standardColors');
  const recentColorsContainer = document.getElementById('recentColors');
  
  // Renk konfigürasyonları
  const themeColors = [
    '#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', 
    '#1abc9c', '#e67e22', '#34495e', '#2980b9', '#27ae60'
  ];

  const standardColors = [
    '#000000', '#7f7f7f', '#880015', '#ed1c24', '#ff7f27', 
    '#fff200', '#22b14c', '#00a2e8', '#3f48cc', '#a349a4',
    '#ffffff', '#c3c3c3', '#b97a57', '#ffaec9', '#ffc90e', 
    '#efe4b0', '#b5e61d', '#99d9ea', '#7092be', '#c8bfe7'
  ];
  
  // Son kullanılan renkler
  const recentColors = [];
  const maxRecentColors = 10;
  
  // Popup göster/gizle
  colorPickerTrigger.addEventListener('click', function(e) {
    e.stopPropagation();
    colorPickerPopup.classList.toggle('active');
    
    // Debug: popup görünür mü kontrol et
    console.log('Popup görünürlük:', colorPickerPopup.classList.contains('active'));
    console.log('Popup style:', getComputedStyle(colorPickerPopup).display);
  });
  
  // Popup dışına tıklandığında kapat
  document.addEventListener('click', function(e) {
    if (!colorPickerTrigger.contains(e.target) && !colorPickerPopup.contains(e.target)) {
      colorPickerPopup.classList.remove('active');
    }
  });
  
  // Renk seçicisini başlat
  initColorPicker();
  
  // Color picker'ı başlat
  function initColorPicker() {
    console.log('Renk seçici başlatılıyor...');
    
    // Varsayılan rengi ayarla
    const initialColor = '#3498db';
    updateSelectedColor(initialColor);
    
    // Tema renklerini oluştur
    themeColorsContainer.innerHTML = ''; // İçeriği temizle
    themeColors.forEach(color => {
      addColorItem(themeColorsContainer, color);
    });
    
    // Standart renkleri oluştur
    standardColorsContainer.innerHTML = ''; // İçeriği temizle
    standardColors.forEach(color => {
      addColorItem(standardColorsContainer, color);
    });
    
    // Son kullanılan renkleri güncelle
    updateRecentColorsDisplay();
    
    // Özel renk seçici
    customColorPicker.addEventListener('input', function() {
      updateSelectedColor(this.value);
    });
    
    console.log('Renk seçici başlatıldı.');
  }
  
  // Bir renk öğesi ekle
  function addColorItem(container, color) {
    const colorItem = document.createElement('div');
    colorItem.className = 'color-item';
    colorItem.style.backgroundColor = color;
    colorItem.addEventListener('click', function() {
      updateSelectedColor(color);
    });
    container.appendChild(colorItem);
  }
  
  // Seçilen rengi güncelle
  function updateSelectedColor(color) {
    console.log('Renk güncelleniyor:', color);
    shapeColorInput.value = color;
    currentColorSwatch.style.backgroundColor = color;
    customColorPicker.value = color;
    
    // Seçili şekil varsa ona rengi uygula
    const selectedShape = document.querySelector('.shape.selected');
    if (selectedShape) {
      applyColorToShape(selectedShape, color);
    }
    
    // Son kullanılan renklere ekle
    addToRecentColors(color);
    
    // Popup'ı kapat
    colorPickerPopup.classList.remove('active');
  }
  
  // Son kullanılan renklere ekle
  function addToRecentColors(color) {
    // Renk zaten varsa önce kaldır
    const index = recentColors.indexOf(color);
    if (index !== -1) {
      recentColors.splice(index, 1);
    }
    
    // Listenin başına ekle
    recentColors.unshift(color);
    
    // Maksimum sayıda renk tut
    if (recentColors.length > maxRecentColors) {
      recentColors.pop();
    }
    
    // Görünümü güncelle
    updateRecentColorsDisplay();
  }
  
  // Son kullanılan renkleri göster
  function updateRecentColorsDisplay() {
    recentColorsContainer.innerHTML = '';
    recentColors.forEach(color => {
      addColorItem(recentColorsContainer, color);
    });
  }
  
  // Şekle renk uygula
  function applyColorToShape(shape, color) {
    if (shape.classList.contains('triangle')) {
      // Üçgen için rengi değiştir
      let height = 100; // Varsayılan yükseklik
      
      if (shape.style.borderBottom) {
        const match = shape.style.borderBottom.match(/(\d+)px/);
        if (match && match[1]) {
          height = parseInt(match[1]);
        }
      }
      
      // Rengi değiştir, boyutu koru
      shape.style.borderBottom = height + "px solid " + color;
    } 
    else {
      // Diğer şekiller için arka plan rengi
      shape.style.backgroundColor = color;
    }
  }
});


  document.addEventListener('DOMContentLoaded', function() {
  // Metin renk seçici elemanları
  const textColorPicker = document.getElementById('textColorValue');
  const textColorPickerTrigger = document.getElementById('textColorPickerTrigger');
  const textColorPickerPopup = document.getElementById('textColorPickerPopup');
  const textCurrentColorSwatch = document.getElementById('textCurrentColorSwatch');
  const textColorValue = document.getElementById('textColorValue');
  const textCustomColorPicker = document.getElementById('textCustomColorPicker');
  const textThemeColorsContainer = document.getElementById('textThemeColors');
  const textStandardColorsContainer = document.getElementById('textStandardColors');
  const textRecentColorsContainer = document.getElementById('textRecentColors');

  // Renk konfigürasyonları
  const textThemeColors = [
    '#000000', '#FFFFFF', '#3498db', '#2ecc71', '#e74c3c', 
    '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#34495e'
  ];

  const textStandardColors = [
    '#000000', '#7f7f7f', '#880015', '#ed1c24', '#ff7f27', 
    '#fff200', '#22b14c', '#00a2e8', '#3f48cc', '#a349a4',
    '#ffffff', '#c3c3c3', '#b97a57', '#ffaec9', '#ffc90e', 
    '#efe4b0', '#b5e61d', '#99d9ea', '#7092be', '#c8bfe7'
  ];

  // Son kullanılan renkler
  const textRecentColors = [];
  const maxTextRecentColors = 10;

  // Popup göster/gizle
  textColorPickerTrigger.addEventListener('click', function(e) {
    e.stopPropagation();
    textColorPickerPopup.classList.toggle('active');
  });

  // Popup dışına tıklandığında kapat
  document.addEventListener('click', function(e) {
    if (!textColorPickerTrigger.contains(e.target) && !textColorPickerPopup.contains(e.target)) {
      textColorPickerPopup.classList.remove('active');
    }
  });

  // Renk seçicisini başlat
  initTextColorPicker();

  // Color picker'ı başlat
  function initTextColorPicker() {
    // Varsayılan rengi ayarla
    const initialColor = '#000000';
    updateSelectedTextColor(initialColor);

    // Tema renklerini oluştur
    textThemeColorsContainer.innerHTML = ''; // İçeriği temizle
    textThemeColors.forEach(color => {
      addTextColorItem(textThemeColorsContainer, color);
    });

    // Standart renkleri oluştur
    textStandardColorsContainer.innerHTML = ''; // İçeriği temizle
    textStandardColors.forEach(color => {
      addTextColorItem(textStandardColorsContainer, color);
    });

    // Son kullanılan renkleri güncelle
    updateTextRecentColorsDisplay();

    // Özel renk seçici
    textCustomColorPicker.addEventListener('input', function() {
      updateSelectedTextColor(this.value);
    });
  }

  // Bir renk öğesi ekle
  function addTextColorItem(container, color) {
    const colorItem = document.createElement('div');
    colorItem.className = 'color-item';
    colorItem.style.backgroundColor = color;
    colorItem.addEventListener('click', function() {
      updateSelectedTextColor(color);
    });
    container.appendChild(colorItem);
  }

  // Seçilen rengi güncelle
  function updateSelectedTextColor(color) {
    textColorValue.value = color;
    textCurrentColorSwatch.style.backgroundColor = color;
    textCustomColorPicker.value = color;

    // Seçili şekil varsa yazı rengini güncelle
    const selectedShape = document.querySelector('.shape.selected');
    if (selectedShape) {
      const textElem = selectedShape.querySelector('.shape-text');
      if (textElem) {
        textElem.style.color = color;
      }
    }

    // Son kullanılan renklere ekle
    addToTextRecentColors(color);

    // Popup'ı kapat
    textColorPickerPopup.classList.remove('active');
  }

  // Son kullanılan renklere ekle
  function addToTextRecentColors(color) {
    // Renk zaten varsa önce kaldır
    const index = textRecentColors.indexOf(color);
    if (index !== -1) {
      textRecentColors.splice(index, 1);
    }

    // Listenin başına ekle
    textRecentColors.unshift(color);

    // Maksimum sayıda renk tut
    if (textRecentColors.length > maxTextRecentColors) {
      textRecentColors.pop();
    }

    // Görünümü güncelle
    updateTextRecentColorsDisplay();
  }

  // Son kullanılan renkleri göster
  function updateTextRecentColorsDisplay() {
    textRecentColorsContainer.innerHTML = '';
    textRecentColors.forEach(color => {
      addTextColorItem(textRecentColorsContainer, color);
    });
  }
});


  // Zengin metin editöründe renk seçici için özel fonksiyon
function setupRichTextColorPicker(toolbar, editor) {
  const colors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', 
    '#FFFF00', '#FF00FF', '#00FFFF', '#3498db', '#e74c3c'
  ];

  // Renk seçici butonunu oluştur
  const colorPickerBtn = document.createElement('div');
  colorPickerBtn.className = 'color-button-wrapper text-color-button';
  colorPickerBtn.innerHTML = `
    <i class="fas fa-palette"></i>
    <div class="color-indicator" style="background-color: #000000;"></div>
  `;

  // Renk seçici popup'ını oluştur
  const colorPickerPopup = document.createElement('div');
  colorPickerPopup.className = 'color-picker-popup';
  colorPickerPopup.innerHTML = `
    <div class="color-section">
      <h5>Standart Renkler</h5>
      <div class="color-grid" id="richTextStandardColors"></div>
    </div>
    <div class="color-section">
      <h5>Özel Renk</h5>
      <div class="custom-color-input">
        <input type="color" id="richTextCustomColorPicker" value="#000000">
        <label for="richTextCustomColorPicker">Özel Renk Seç</label>
      </div>
    </div>
  `;

  // Standart renkleri ekle
  const standardColorsGrid = colorPickerPopup.querySelector('#richTextStandardColors');
  colors.forEach(color => {
    const colorItem = document.createElement('div');
    colorItem.className = 'color-item';
    colorItem.style.backgroundColor = color;
    colorItem.addEventListener('click', () => {
      applyColor(color);
    });
    standardColorsGrid.appendChild(colorItem);
  });

  // Özel renk seçici
  const customColorPicker = colorPickerPopup.querySelector('#richTextCustomColorPicker');
  customColorPicker.addEventListener('input', () => {
    applyColor(customColorPicker.value);
  });

  // Renk uygulama fonksiyonu
  function applyColor(color) {
    document.execCommand('foreColor', false, color);
    
    // Renk göstergesini güncelle
    const colorIndicator = colorPickerBtn.querySelector('.color-indicator');
    colorIndicator.style.backgroundColor = color;
    
    // Editörü tekrar odakla
    editor.focus();
    
    // Popup'ı kapat
    colorPickerPopup.classList.remove('active');
  }

  // Popup toggle
  colorPickerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    colorPickerPopup.classList.toggle('active');
    
    // Popup pozisyonunu ayarla
    const rect = colorPickerBtn.getBoundingClientRect();
    colorPickerPopup.style.position = 'absolute';
    colorPickerPopup.style.top = `${rect.bottom + 5}px`;
    colorPickerPopup.style.left = `${rect.left}px`;
  });

  // Popup dışına tıklandığında kapat
  document.addEventListener('click', (e) => {
    if (!colorPickerBtn.contains(e.target) && !colorPickerPopup.contains(e.target)) {
      colorPickerPopup.classList.remove('active');
    }
  });

  // Popup'ı toolbar'a ekle
  colorPickerBtn.appendChild(colorPickerPopup);
  toolbar.appendChild(colorPickerBtn);
}

// Zengin metin düzenleyici açma fonksiyonunu güncelle
window.openRichTextEditor = function(shape) {
  // Önceki editörü kaldır
  const existingEditor = document.querySelector('.rich-text-editor-container');
  if (existingEditor) {
    existingEditor.remove();
  }

  // Mevcut içeriği al (HTML olarak)
  const currentTextElem = shape.querySelector('.shape-text');
  const currentHTML = currentTextElem ? currentTextElem.innerHTML : "";

  // Editör konteynerini oluştur
  const editorContainer = document.createElement('div');
  editorContainer.className = 'rich-text-editor-container';
  editorContainer.style.zIndex = '2000';
  
  // Araç çubuğunu oluştur
  const toolbar = document.createElement('div');
  toolbar.className = 'rich-text-toolbar';
  toolbar.innerHTML = `
    <button type="button" data-command="bold" title="Kalın"><i class="fas fa-bold"></i></button>
    <button type="button" data-command="italic" title="İtalik"><i class="fas fa-italic"></i></button>
    <button type="button" data-command="underline" title="Altı Çizili"><i class="fas fa-underline"></i></button>
    <div class="toolbar-separator"></div>
    
    <button type="button" data-command="justifyLeft" title="Sola Hizala"><i class="fas fa-align-left"></i></button>
    <button type="button" data-command="justifyCenter" title="Ortala"><i class="fas fa-align-center"></i></button>
    <button type="button" data-command="justifyRight" title="Sağa Hizala"><i class="fas fa-align-right"></i></button>
    <div class="toolbar-separator"></div>
    <button type="button" data-command="fontSize" data-value="1" title="Küçük Yazı"><i class="fas fa-text-height"></i><sub>S</sub></button>
    <button type="button" data-command="fontSize" data-value="3" title="Normal Yazı"><i class="fas fa-text-height"></i><sub>M</sub></button>
    <button type="button" data-command="fontSize" data-value="7" title="Büyük Yazı"><i class="fas fa-text-height"></i><sub>L</sub></button>
  `;
  
  // Düzenleyici içeriğini oluştur
  const editor = document.createElement('div');
  editor.className = 'rich-text-editor';
  editor.contentEditable = true;
  editor.innerHTML = currentHTML;
  
  // Buton konteynerini oluştur
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'editor-button-container';
  
  // Kaydet ve İptal butonlarını oluştur
  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Kaydet';
  saveBtn.className = 'editor-btn save-btn';
  
  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'İptal';
  cancelBtn.className = 'editor-btn cancel-btn';
  
  // Butonları konteynere ekle
  buttonContainer.appendChild(saveBtn);
  buttonContainer.appendChild(cancelBtn);
  
  // Tüm bileşenleri ana konteynere ekle
  editorContainer.appendChild(toolbar);
  editorContainer.appendChild(editor);
  editorContainer.appendChild(buttonContainer);
  
  // Konteyneri canvas'a ekle
  document.querySelector('.canvas').appendChild(editorContainer);
  
  // Editörü şeklin yanına konumlandır
  positionEditor(editorContainer, shape);
  
  // Renk seçiciyi kur
  setupRichTextColorPicker(toolbar, editor);
  
  // Araç çubuğu butonları için olay dinleyici
  toolbar.addEventListener('click', function(e) {
    e.stopPropagation();
    const button = e.target.closest('button');
    if (!button) return;
    
    const command = button.getAttribute('data-command');
    if (!command) return;
    
    const value = button.getAttribute('data-value');
    
    document.execCommand(command, false, value);
    editor.focus();
  });
  
  // Kaydet butonu olayı
  saveBtn.addEventListener('click', function() {
    saveContent();
  });
  
  // İptal butonu olayı
  cancelBtn.addEventListener('click', function() {
    editorContainer.remove();
  });
  
  // Klavye kısayolları
  editor.addEventListener('keydown', function(e) {
    // Escape tuşu
    if (e.key === 'Escape') {
      editorContainer.remove();
    }
    
    // Ctrl+Enter
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      saveContent();
    }
  });
  
  // Tıklama olayını engelle
  editor.addEventListener('mousedown', function(e) {
    e.stopPropagation();
  });
  
  // İçeriği kaydetme fonksiyonu
  function saveContent() {
    const content = editor.innerHTML.trim();
    
    // Eski metni kaldır
    const oldText = shape.querySelector('.shape-text');
    if (oldText) oldText.remove();
    
    // Yeni metin ekle
    if (content) {
      const textElem = document.createElement('div');
      textElem.className = 'shape-text';
      textElem.innerHTML = content;
      shape.appendChild(textElem);
    }
    
    // Editörü kaldır
    editorContainer.remove();
  }
  
  // Editörü odakla
  setTimeout(() => {
    editor.focus();
    // İmleci sona taşı
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(editor);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  }, 10);

  // Editörü konumlandır
  function positionEditor(editorContainer, shape) {
    const shapeRect = shape.getBoundingClientRect();
    const canvasRect = document.querySelector('.canvas').getBoundingClientRect();
    
    // Editör genişliği
    const editorWidth = Math.min(Math.max(shapeRect.width * 1.5, 350), 500);
    
    // Pozisyon hesapla
    let left = shapeRect.right - canvasRect.left + 10;
    let top = shapeRect.top - canvasRect.top;
    
    // Sağa taşıyorsa sola konumlandır
    if (left + editorWidth > canvasRect.width - 20) {
      left = shapeRect.left - canvasRect.left - editorWidth - 10;
    }
    
    // Sol kenara çok yakınsa, şeklin üstüne yerleştir
    if (left < 10) {
      left = Math.max(10, (shapeRect.left + shapeRect.right) / 2 - canvasRect.left - editorWidth / 2);
      top = shapeRect.top - canvasRect.top - editorContainer.offsetHeight - 10;
      
      // Üste sığmıyorsa alta yerleştir
      if (top < 10) {
        top = shapeRect.bottom - canvasRect.top + 10;
      }
    }
    
    // Stili ayarla
    editorContainer.style.position = 'absolute';
    editorContainer.style.left = `${left}px`;
    editorContainer.style.top = `${top}px`;
    editorContainer.style.width = `${editorWidth}px`;
  }
};

// Çift tıklama olayını yakala
document.addEventListener('dblclick', function(e) {
  const shape = e.target.closest('.shape');
  if (shape) {
    e.stopPropagation();
    window.openRichTextEditor(shape);
  }
}, true);

// Canvas'a tıklandığında editörü kapat
document.querySelector('.canvas').addEventListener('mousedown', function(e) {
  if (!e.target.closest('.rich-text-editor-container') && !e.target.closest('.shape')) {
    const editor = document.querySelector('.rich-text-editor-container');
    if (editor) editor.remove();
  }
});
// Çoklu seçim için gerekli değişkenler
let isMultiSelecting = false;
let multiSelectStartX, multiSelectStartY;
let multiSelectBox;

// Canvas için çoklu seçim event listener'ları
canvas.addEventListener('mousedown', startMultiSelect);
document.addEventListener('mousemove', performMultiSelect);
document.addEventListener('mouseup', endMultiSelect);

// Canvas için çoklu seçim event listener'ları iyileştirilmiş hali
function startMultiSelect(e) {
  // Sadece canvas üzerinde çalış ve Shift tuşuna basılmamışsa
  if (e.target !== canvas || e.shiftKey) return;
  
  // Herhangi bir çizgi veya boyama modundaysa seçime izin verme
  if (lineMode || orthoLineMode || urgoLineMode || paintBrushMode) return;
  
  // Eğer Ctrl tuşuna basılı değilse ve şekle tıklanmadıysa
  if (!e.ctrlKey && !e.target.closest('.shape')) {
    // Mevcut seçimleri temizle
    document.querySelectorAll('.shape.selected').forEach(shape => {
      shape.classList.remove('selected');
      removeResizeHandle(shape);
    });
    selectedShape = null;
  }

  isMultiSelecting = true;
  multiSelectStartX = e.clientX;
  multiSelectStartY = e.clientY;

  // Seçim kutusu oluştur
  multiSelectBox = document.createElement('div');
  multiSelectBox.style.position = 'absolute';
  multiSelectBox.style.border = '2px solid rgba(52, 152, 219, 0.5)';
  multiSelectBox.style.backgroundColor = 'rgba(52, 152, 219, 0.1)';
  multiSelectBox.style.pointerEvents = 'none';
  multiSelectBox.style.zIndex = '1000';
  canvas.appendChild(multiSelectBox);
}

// Çoklu şekil taşıma için düzeltilmiş fonksiyon
function dragMultipleShapes(e) {
  const selectedShapes = document.querySelectorAll('.shape.selected');
  if (selectedShapes.length === 0) return;

  const canvasRect = canvas.getBoundingClientRect();
  
  // İlk seçili şeklin taşıma koordinatlarını kullan
  const firstShape = selectedShapes[0];
  let newX = e.clientX - offsetX - canvasRect.left;
  let newY = e.clientY - offsetY - canvasRect.top;
  
  // Grid'e hizalama
  newX = Math.round(newX / gridSize) * gridSize;
  newY = Math.round(newY / gridSize) * gridSize;
  
  // İlk şeklin ne kadar hareket ettiğini hesapla
  const deltaX = newX - parseInt(firstShape.style.left);
  const deltaY = newY - parseInt(firstShape.style.top);
  
  // Tüm seçili şekilleri delta kadar taşı
  selectedShapes.forEach(shape => {
    const currentLeft = parseInt(shape.style.left);
    const currentTop = parseInt(shape.style.top);
    
    shape.style.left = `${currentLeft + deltaX}px`;
    shape.style.top = `${currentTop + deltaY}px`;
    
    // Global fonksiyonu kullan
    if (typeof window.updateLines === 'function') {
      window.updateLines(shape);
    }
  });
}

// startDrag fonksiyonunu düzeltilmiş hali
function startDrag(e) {
  if (isResizing) return;
  if (lineMode || orthoLineMode || urgoLineMode || paintBrushMode) return;
  
  e.preventDefault();
  
  const shape = this;
  
  // Ctrl tuşu ile çoklu seçim
  if (e.ctrlKey) {
    shape.classList.toggle('selected');
    if (shape.classList.contains('selected')) {
      addResizeHandle(shape);
      selectedShape = shape; // Son seçilen şekil aktif olur
    } else {
      removeResizeHandle(shape);
      if (selectedShape === shape) {
        selectedShape = document.querySelector('.shape.selected:last-child') || null;
      }
    }
    updateTextControls();
    return; // Ctrl ile sadece seçim değişir, sürükleme başlamaz
  }
  
  const isAlreadySelected = shape.classList.contains('selected');
  const selectedShapes = document.querySelectorAll('.shape.selected');
  
  // Seçili değilse, diğer seçimleri kaldır
  if (!isAlreadySelected) {
    selectedShapes.forEach(s => {
      s.classList.remove('selected');
      removeResizeHandle(s);
    });
    shape.classList.add('selected');
    addResizeHandle(shape);
    selectedShape = shape;
    updateTextControls();
  }
  
  // Taşıma için gerekli bilgileri hazırla
  const rect = shape.getBoundingClientRect();
  offsetX = e.clientX - rect.left;
  offsetY = e.clientY - rect.top;
  
  // Çoklu taşıma fonksiyonunu kullan
  document.addEventListener('mousemove', dragMultipleShapes);
  document.addEventListener('mouseup', stopDrag);
}

// Klavye kısayolları için event listener
document.addEventListener('keydown', function(e) {
  // Eğer textarea ya da input üzerindeyse veya richtext editörü açıksa işlem yapma
  if (e.target.matches('input, textarea') || document.querySelector('.rich-text-editor-container')) {
    return;
  }
  
  // Ctrl+C ile kopyalama
  if (e.ctrlKey && e.key.toLowerCase() === 'c') {
    e.preventDefault();
    const selectedShapes = document.querySelectorAll('.shape.selected');
    if (selectedShapes.length > 0) {
      copyMultipleShapes();
    }
  }
  
  // Delete tuşu ile silme
  if (e.key === 'Delete') {
    e.preventDefault();
    const selectedShapes = document.querySelectorAll('.shape.selected');
    if (selectedShapes.length > 0) {
      deleteMultipleShapes();
    }
  }
  
  // Ctrl+A ile tümünü seç
  if (e.ctrlKey && e.key.toLowerCase() === 'a') {
    e.preventDefault();
    const allShapes = document.querySelectorAll('.shape');
    allShapes.forEach(shape => {
      shape.classList.add('selected');
      addResizeHandle(shape);
    });
    if (allShapes.length > 0) {
      selectedShape = allShapes[allShapes.length - 1];
      updateTextControls();
    }
  }
  
  // ESC tuşu ile seçimi kaldır
  if (e.key === 'Escape') {
    e.preventDefault();
    document.querySelectorAll('.shape.selected').forEach(shape => {
      shape.classList.remove('selected');
      removeResizeHandle(shape);
    });
    selectedShape = null;
  }
});

// Hizalama için düğmeler
document.getElementById('alignLeftBtn').addEventListener('click', () => {
  const selectedShapes = document.querySelectorAll('.shape.selected');
  if (selectedShapes.length < 2) return;
  alignMultipleShapes('left');
});

document.getElementById('alignCenterBtn').addEventListener('click', () => {
  const selectedShapes = document.querySelectorAll('.shape.selected');
  if (selectedShapes.length < 2) return;
  alignMultipleShapes('center-horizontal');
});

document.getElementById('alignRightBtn').addEventListener('click', () => {
  const selectedShapes = document.querySelectorAll('.shape.selected');
  if (selectedShapes.length < 2) return;
  alignMultipleShapes('right');
});

document.getElementById('alignTopBtn').addEventListener('click', () => {
  const selectedShapes = document.querySelectorAll('.shape.selected');
  if (selectedShapes.length < 2) return;
  alignMultipleShapes('top');
});

document.getElementById('alignMiddleBtn').addEventListener('click', () => {
  const selectedShapes = document.querySelectorAll('.shape.selected');
  if (selectedShapes.length < 2) return;
  alignMultipleShapes('center-vertical');
});

document.getElementById('alignBottomBtn').addEventListener('click', () => {
  const selectedShapes = document.querySelectorAll('.shape.selected');
  if (selectedShapes.length < 2) return;
  alignMultipleShapes('bottom');
});

// Hizalama için işlevleri ekleyin
// Hizalama için işlevleri düzeltin
function alignMultipleShapes(alignment) {
  const selectedShapes = document.querySelectorAll('.shape.selected');
  if (selectedShapes.length < 2) return;

  // Referans şekli al (ilk olarak en son seçilen, yoksa ilk şekil)
  const referenceShape = selectedShape || selectedShapes[0];

  selectedShapes.forEach(shape => {
    if (shape === referenceShape) return;

    switch(alignment) {
      case 'left':
        shape.style.left = referenceShape.style.left;
        break;
      case 'center-horizontal':
        const refCenterX = parseInt(referenceShape.style.left) + referenceShape.offsetWidth / 2;
        shape.style.left = `${refCenterX - shape.offsetWidth / 2}px`;
        break;
      case 'right':
        const refRight = parseInt(referenceShape.style.left) + referenceShape.offsetWidth;
        const shapeWidth = shape.offsetWidth;
        shape.style.left = `${refRight - shapeWidth}px`;
        break;
      case 'top':
        shape.style.top = referenceShape.style.top;
        break;
      case 'center-vertical':
        const refCenterY = parseInt(referenceShape.style.top) + referenceShape.offsetHeight / 2;
        shape.style.top = `${refCenterY - shape.offsetHeight / 2}px`;
        break;
      case 'bottom':
        const refBottom = parseInt(referenceShape.style.top) + referenceShape.offsetHeight;
        const shapeHeight = shape.offsetHeight;
        shape.style.top = `${refBottom - shapeHeight}px`;
        break;
    }
    
    // Çizgileri DOM Content Loaded içindeki fonksiyonlarla güncelleme
    if (typeof window.updateLines === 'function') {
      window.updateLines(shape);
    }
  });
  
  // Kullanıcıya bilgi ver
  const statusInfo = document.querySelector('.status-info');
  statusInfo.innerHTML = `<i class="fas fa-check-circle"></i> ${selectedShapes.length} şekil hizalandı.`;
  setTimeout(() => {
    statusInfo.innerHTML = '<i class="fas fa-check-circle"></i> Hazır';
  }, 2000);
}

function performMultiSelect(e) {
  if (!isMultiSelecting) return;

  // Seçim kutusunun boyutlarını hesapla
  const currentX = e.clientX;
  const currentY = e.clientY;
  const canvasRect = canvas.getBoundingClientRect();

  const width = Math.abs(currentX - multiSelectStartX);
  const height = Math.abs(currentY - multiSelectStartY);
  const left = Math.min(currentX, multiSelectStartX) - canvasRect.left;
  const top = Math.min(currentY, multiSelectStartY) - canvasRect.top;

  // Seçim kutusunu güncelle
  multiSelectBox.style.width = `${width}px`;
  multiSelectBox.style.height = `${height}px`;
  multiSelectBox.style.left = `${left}px`;
  multiSelectBox.style.top = `${top}px`;

  // Şekillerin seçimini kontrol et
  const shapes = document.querySelectorAll('.shape');
  shapes.forEach(shape => {
    const shapeRect = shape.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();

    // Seçim kutusu ile şeklin kesişimini kontrol et
    const isIntersecting = !(
      shapeRect.right < left + canvasRect.left ||
      shapeRect.left > left + width + canvasRect.left ||
      shapeRect.bottom < top + canvasRect.top ||
      shapeRect.top > top + height + canvasRect.top
    );

    // Ctrl tuşuna basılıysa mevcut seçimi koruyarak ekle/çıkar
    if (e.ctrlKey) {
      if (isIntersecting) {
        shape.classList.toggle('selected');
      }
    } else {
      // Normal seçimde
      if (isIntersecting) {
        shape.classList.add('selected');
        addResizeHandle(shape);
      } else {
        shape.classList.remove('selected');
        removeResizeHandle(shape);
      }
    }
  });
}

function endMultiSelect() {
  if (!isMultiSelecting) return;

  isMultiSelecting = false;

  // Seçim kutusunu kaldır
  if (multiSelectBox) {
    multiSelectBox.remove();
    multiSelectBox = null;
  }

  // Seçili şekilleri belirle
  const selectedShapes = document.querySelectorAll('.shape.selected');
  
  // Son seçilen şekli selectedShape olarak ayarla
  if (selectedShapes.length > 0) {
    selectedShape = selectedShapes[selectedShapes.length - 1];
    updateTextControls();
  }
}

// Çoklu şekil taşıma için ek fonksiyon
function dragMultipleShapes(e) {
  const selectedShapes = document.querySelectorAll('.shape.selected');
  if (selectedShapes.length === 0) return;

  // İlk seçili şeklin taşıma koordinatlarını kullan
  const firstShape = selectedShapes[0];
  const canvasRect = canvas.getBoundingClientRect();
  let x = Math.round((e.clientX - offsetX - canvasRect.left) / gridSize) * gridSize;
  let y = Math.round((e.clientY - offsetY - canvasRect.top) / gridSize) * gridSize;

  // Tüm seçili şekilleri taşı
  selectedShapes.forEach(shape => {
    const shapeOffsetX = parseInt(shape.style.left) - parseInt(firstShape.style.left);
    const shapeOffsetY = parseInt(shape.style.top) - parseInt(firstShape.style.top);

    shape.style.left = `${x + shapeOffsetX}px`;
    shape.style.top = `${y + shapeOffsetY}px`;

    // Bağlı çizgileri güncelle
    updateConnectedLines(shape);
    updateOrthogonalLines(shape);
    updateUrgotonalLines(shape);
  });
}

// startDrag fonksiyonunu güncelle
function startDrag(e) {
  if (isResizing) return;
  if (lineMode || orthoLineMode || urgoLineMode || paintBrushMode) return;
  
  e.preventDefault();
  
  const shape = this;
  const selectedShapes = document.querySelectorAll('.shape.selected');
  
  // Eğer Ctrl tuşuna basılı değilse ve şu an seçili değilse
  if (!e.ctrlKey && !shape.classList.contains('selected')) {
    // Tüm seçimleri temizle
    selectedShapes.forEach(s => {
      s.classList.remove('selected');
      removeResizeHandle(s);
    });
    selectShape(shape);
  } else if (e.ctrlKey) {
    // Ctrl ile çoklu seçim
    shape.classList.toggle('selected');
  }
  
  // Taşıma için gerekli bilgileri hazırla
  const rect = shape.getBoundingClientRect();
  offsetX = e.clientX - rect.left;
  offsetY = e.clientY - rect.top;
  
  document.addEventListener('mousemove', dragMultipleShapes);
  document.addEventListener('mouseup', stopDrag);
}

// stopDrag fonksiyonunu güncelle
function stopDrag() {
  document.removeEventListener('mousemove', dragMultipleShapes);
  document.removeEventListener('mouseup', stopDrag);
}
// Çoklu şekil silme
function deleteMultipleShapes() {
  const selectedShapes = document.querySelectorAll('.shape.selected');
  
  selectedShapes.forEach(shape => {
    // Her şekle bağlı çizgileri kaldır
    removeConnectedLines(shape);
    removeOrthogonalLines(shape);
    removeUrgotonalLines(shape)
    
    // Şekli sil
    canvas.removeChild(shape);
    
    // JSON kayıtlarından kaldır
    if (shape.dataset.jsonId) {
      delete shapeRegistry[shape.dataset.jsonId];
    }
  });

  // Şekil sayısını güncelle
  updateShapeCount();

  // Durum çubuğunda bilgi göster
  const statusInfo = document.querySelector('.status-info');
  statusInfo.innerHTML = `<i class="fas fa-check-circle"></i> ${selectedShapes.length} şekil silindi.`;
  setTimeout(() => {
    statusInfo.innerHTML = '<i class="fas fa-check-circle"></i> Hazır';
  }, 2000);
}

// Çoklu şekil kopyalama
function copyMultipleShapes() {
  const selectedShapes = document.querySelectorAll('.shape.selected');
  const copiedShapes = [];

  selectedShapes.forEach(shape => {
    const newShape = shape.cloneNode(true);
    newShape.id = `shape-${shapeCounter++}`;
    
    // Konumu biraz kaydır
    const currentLeft = parseInt(shape.style.left);
    const currentTop = parseInt(shape.style.top);
    newShape.style.left = (currentLeft + 20) + "px";
    newShape.style.top = (currentTop + 20) + "px";
    
    // Seçim ve başlangıç durumlarını sıfırla
    newShape.classList.remove("selected", "line-start");
    
    // Olay dinleyicilerini yeniden ekle
    newShape.addEventListener('mousedown', startDrag);
    newShape.addEventListener('dblclick', function(e) {
      e.stopPropagation();
      openTextEditor(newShape);
    });
    
    newShape.addEventListener('click', function(e) {
      e.stopPropagation();
      
      if (paintBrushMode) {
        const currentColor = document.getElementById('shapeColor').value;
        applyColorToShape(newShape, currentColor);
        return;
      }
      
      selectShape(newShape);
    });
    
    canvas.appendChild(newShape);
    copiedShapes.push(newShape);
  });

  // Yeni kopyalanan şekilleri seç
  document.querySelectorAll('.shape.selected').forEach(shape => {
    shape.classList.remove('selected');
    removeResizeHandle(shape);
  });
  
  copiedShapes.forEach(shape => {
    shape.classList.add('selected');
    addResizeHandle(shape);
  });

  updateShapeCount();

  // Durum çubuğunda bilgi göster
  const statusInfo = document.querySelector('.status-info');
  statusInfo.innerHTML = `<i class="fas fa-check-circle"></i> ${copiedShapes.length} şekil kopyalandı.`;
  setTimeout(() => {
    statusInfo.innerHTML = '<i class="fas fa-check-circle"></i> Hazır';
  }, 2000);
}

// Çoklu şekil hizalama
function alignMultipleShapes(alignment) {
  const selectedShapes = document.querySelectorAll('.shape.selected');
  if (selectedShapes.length < 2) return;

  // Referans şekli al (genellikle son seçilen)
  const referenceShape = selectedShapes[selectedShapes.length - 1];

  selectedShapes.forEach(shape => {
    if (shape === referenceShape) return;

    switch(alignment) {
      case 'left':
        shape.style.left = referenceShape.style.left;
        break;
      case 'right':
        const refRight = parseInt(referenceShape.style.left) + referenceShape.offsetWidth;
        const shapeWidth = shape.offsetWidth;
        shape.style.left = `${refRight - shapeWidth}px`;
        break;
      case 'top':
        shape.style.top = referenceShape.style.top;
        break;
      case 'bottom':
        const refBottom = parseInt(referenceShape.style.top) + referenceShape.offsetHeight;
        const shapeHeight = shape.offsetHeight;
        shape.style.top = `${refBottom - shapeHeight}px`;
        break;
      case 'center-horizontal':
        const refCenterX = parseInt(referenceShape.style.left) + referenceShape.offsetWidth / 2;
        shape.style.left = `${refCenterX - shape.offsetWidth / 2}px`;
        break;
      case 'center-vertical':
        const refCenterY = parseInt(referenceShape.style.top) + referenceShape.offsetHeight / 2;
        shape.style.top = `${refCenterY - shape.offsetHeight / 2}px`;
        break;
    }

    // Çizgileri güncelle
    updateConnectedLines(shape);
    updateOrthogonalLines(shape);
    updateUrgotonalLines(shape);
  });
}

// Klavye kısayolları için event listener
document.addEventListener('keydown', function(e) {
  // Ctrl+C ile kopyalama
  if (e.ctrlKey && e.key.toLowerCase() === 'c') {
    const selectedShapes = document.querySelectorAll('.shape.selected');
    if (selectedShapes.length > 0) {
      copyMultipleShapes();
    }
  }
  
  // Delete tuşu ile silme
  if (e.key === 'Delete') {
    const selectedShapes = document.querySelectorAll('.shape.selected');
    if (selectedShapes.length > 0) {
      deleteMultipleShapes();
    }
  }
});

// Hizalama butonları eklemek için header'a butonlar ekleyin
const headerGroup = document.querySelector('.header-group');
headerGroup.innerHTML += `
  <div class="header-group">
    <button id="alignLeftBtn" class="tooltip" data-tooltip="Sola Hizala">
      <i class="fas fa-align-left"></i>
    </button>
    <button id="alignRightBtn" class="tooltip" data-tooltip="Sağa Hizala">
      <i class="fas fa-align-right"></i>
    </button>
    <button id="alignTopBtn" class="tooltip" data-tooltip="Üste Hizala">
      <i class="fas fa-arrow-up"></i>
    </button>
    <button id="alignBottomBtn" class="tooltip" data-tooltip="Alta Hizala">
      <i class="fas fa-arrow-down"></i>
    </button>
  </div>
`;

// Hizalama butonları için event listener'lar
document.getElementById('alignLeftBtn').addEventListener('click', () => alignMultipleShapes('left'));
document.getElementById('alignRightBtn').addEventListener('click', () => alignMultipleShapes('right'));
document.getElementById('alignTopBtn').addEventListener('click', () => alignMultipleShapes('top'));
document.getElementById('alignBottomBtn').addEventListener('click', () => alignMultipleShapes('bottom'));
function addResizeHandle(shape) {
  removeResizeHandle(shape);
  const handle = document.createElement('div');
  handle.className = 'resize-handle';
  shape.appendChild(handle);
  handle.addEventListener('mousedown', function(e) {
    e.stopPropagation();
    isResizing = true;
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = shape.offsetWidth;
    const startHeight = shape.offsetHeight;
    function resize(e) {
      let newWidth = startWidth + (e.clientX - startX);
      let newHeight = startHeight + (e.clientY - startY);
      newWidth = Math.round(newWidth / gridSize) * gridSize;
      newHeight = Math.round(newHeight / gridSize) * gridSize;
      if (newWidth < gridSize) newWidth = gridSize;
      if (newHeight < gridSize) newHeight = gridSize;
      
      if (shape.classList.contains('triangle')) {
        // Üçgen için özel boyutlandırma
        shape.style.borderLeft = `${newWidth / 2}px solid transparent`;
        shape.style.borderRight = `${newWidth / 2}px solid transparent`;
        shape.style.borderBottom = `${newHeight}px solid ${shape.style.borderBottomColor || shapeColorInput.value}`;
        shape.style.width = '0';
        shape.style.height = '0';
      } else if (shape.classList.contains('circle')) {
        // Çember için özel boyutlandırma
        // Daire olması için width = height yap
        const size = Math.max(newWidth, newHeight);
        shape.style.width = `${size}px`;
        shape.style.height = `${size}px`;
        shape.style.borderRadius = '50%';
      } else {
        // Kare ve dikdörtgen için normal boyutlandırma
        shape.style.width = `${newWidth}px`;
        shape.style.height = `${newHeight}px`;
      }
      
      updateConnectedLines(shape);
      updateOrthogonalLines(shape);
      updateUrgotonalLines(shape);
    }
    function stopResize() {
      document.removeEventListener('mousemove', resize);
      document.removeEventListener('mouseup', stopResize);
      isResizing = false;
    }
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResize);
  });
}
function updateTextControls() {
  if (!selectedShape) return;
  const textElem = selectedShape.querySelector('.shape-text');
  if (textElem) {
  fontSizeSelect.value = parseInt(window.getComputedStyle(textElem).fontSize);
  boldToggle.checked = window.getComputedStyle(textElem).fontWeight === "700" || window.getComputedStyle(textElem).fontWeight === "bold";
  italicToggle.checked = window.getComputedStyle(textElem).fontStyle === "italic";
  fontFamilySelect.value = window.getComputedStyle(textElem).fontFamily.replace(/["']/g, "");
  
  // Metin rengi için doğru seçiciyi kullan
  const textColorValue = document.getElementById('textColorValue');
  const textCurrentColorSwatch = document.getElementById('textCurrentColorSwatch');
  
  if (textColorValue && textCurrentColorSwatch) {
    const textColor = rgbToHex(window.getComputedStyle(textElem).color);
    textColorValue.value = textColor;
    textCurrentColorSwatch.style.backgroundColor = textColor;
  }
  }
  }