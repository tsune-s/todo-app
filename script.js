// タスクを保存する配列
let tasks = [];

// タスクを追加する関数
function addTask() {
    const input = document.getElementById('taskInput');
    const taskText = input.value.trim();
    
    if (taskText === '') return;
    
    const task = {
        id: Date.now(),
        text: taskText,
        completed: false,
        date: new Date().toLocaleString('ja-JP')
    };
    
    tasks.push(task);
    input.value = '';
    renderTasks();
}

// タスクを表示する関数
function renderTasks() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        if (task.completed) li.classList.add('completed');
        
        // ドラッグ&ドロップ用の属性を追加
        li.draggable = true;
        li.dataset.index = index;
        
        // ドラッグ&ドロップイベントリスナーを追加
        li.addEventListener('dragstart', handleDragStart);
        li.addEventListener('dragend', handleDragEnd);
        li.addEventListener('dragover', handleDragOver);
        li.addEventListener('drop', handleDrop);
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.onclick = () => toggleTask(task.id);
        
        const span = document.createElement('span');
        span.textContent = task.text;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '削除';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.onclick = () => deleteTask(task.id);
        
        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(deleteBtn);
        taskList.appendChild(li);
    });
}

// エクセルエクスポート関数
function exportToExcel() {
    // ヘッダー行
    const headers = ['タスク', '状態', '作成日時'];
    
    // データ行の作成
    const rows = tasks.map(task => [
        task.text,
        task.completed ? '完了' : '未完了',
        task.date
    ]);
    
    // CSVデータの作成
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');
    
    // BOMを追加して文字化けを防ぐ
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // ダウンロードリンクの作成
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `todo_list_${new Date().toLocaleDateString('ja-JP')}.csv`);
    link.style.visibility = 'hidden';
    
    // ダウンロードの実行
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ドラッグ&ドロップ関連の関数
let draggedItem = null;

function handleDragStart(e) {
    draggedItem = this;
    this.classList.add('dragging');
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    draggedItem = null;
}

function handleDragOver(e) {
    e.preventDefault();
    if (this === draggedItem) return;
    
    const rect = this.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    
    if (e.clientY < midY) {
        this.parentNode.insertBefore(draggedItem, this);
    } else {
        this.parentNode.insertBefore(draggedItem, this.nextSibling);
    }
}

function handleDrop(e) {
    e.preventDefault();
    updateTaskOrder();
}

// タスクの順序を更新する関数
function updateTaskOrder() {
    const taskList = document.getElementById('taskList');
    const newTasks = [];
    
    taskList.querySelectorAll('li').forEach(li => {
        const index = parseInt(li.dataset.index);
        newTasks.push(tasks[index]);
    });
    
    tasks = newTasks;
    renderTasks();
}

// タスクの完了/未完了を切り替える関数
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        renderTasks();
    }
}

// タスクを削除する関数
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    renderTasks();
}

// Enterキーでタスクを追加
document.getElementById('taskInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTask();
    }
}); 