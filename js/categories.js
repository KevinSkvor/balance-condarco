async function loadCategories() {
    const { data: cats } = await supabase
        .from('categories').select('*').order('block').order('sort_order');

    const container = document.getElementById('categories-container');
    if (!cats?.length) {
        container.innerHTML = '<p class="text-muted" style="text-align:center;padding:2rem">No hay categorías.</p>';
        return;
    }

    const bloques = ['ingreso', 'ingreso_extra', 'blanco', 'negro', 'personal'];
    let html = '';

    for (const bloque of bloques) {
        const items = cats.filter(c => c.block === bloque);
        if (!items.length) continue;

        html += `
        <div class="cat-group">
            <div class="section-header">
                <span class="section-title"><span class="dot dot-${bloque}"></span>${BLOQUES_LABEL[bloque]}</span>
                <span class="text-muted" style="font-size:.82rem">${items.length} categorías</span>
            </div>
            <ul class="cat-list">
            ${items.map(cat => `
                <li class="cat-item${cat.active ? '' : ' inactive'}">
                    <span>${cat.name}${!cat.active ? ' <em style="font-size:.8rem;color:var(--muted)">(inactiva)</em>' : ''}</span>
                    <div class="cat-actions">
                        <button class="btn btn-outline btn-sm" onclick="openEdit('${cat.id}')">Editar</button>
                        <button class="btn btn-outline btn-sm" onclick="toggleActive('${cat.id}', ${cat.active})">
                            ${cat.active ? 'Desactivar' : 'Activar'}
                        </button>
                    </div>
                </li>`).join('')}
            </ul>
        </div>`;
    }

    container.innerHTML = html;
}

async function openEdit(id) {
    const { data: cat } = await supabase.from('categories').select('*').eq('id', id).single();
    if (!cat) return;
    document.getElementById('modal-title').textContent = 'Editar categoría';
    document.getElementById('cat-id').value    = cat.id;
    document.getElementById('cat-name').value  = cat.name;
    document.getElementById('cat-block').value = cat.block;
    openModal();
}

function openModal() {
    document.getElementById('form-error').style.display = 'none';
    document.getElementById('modal-overlay').classList.add('open');
}

function closeModal() {
    document.getElementById('modal-overlay').classList.remove('open');
    document.getElementById('cat-form').reset();
    document.getElementById('cat-id').value = '';
    document.getElementById('modal-title').textContent = 'Nueva categoría';
}

async function toggleActive(id, currentlyActive) {
    const msg = currentlyActive
        ? '¿Desactivar? No aparecerá para nuevos movimientos.'
        : '¿Activar esta categoría?';
    if (!confirm(msg)) return;
    await supabase.from('categories').update({ active: !currentlyActive }).eq('id', id);
    loadCategories();
}

document.getElementById('cat-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id    = document.getElementById('cat-id').value;
    const name  = document.getElementById('cat-name').value.trim();
    const block = document.getElementById('cat-block').value;

    const { error } = id
        ? await supabase.from('categories').update({ name, block }).eq('id', id)
        : await supabase.from('categories').insert({ name, block });

    if (error) { showError('form-error', 'Error al guardar.'); return; }
    closeModal();
    loadCategories();
});

(async () => {
    if (!await initPage(true)) return;

    document.getElementById('btn-nueva').addEventListener('click', () => {
        closeModal(); openModal();
    });
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-cancel').addEventListener('click', closeModal);
    document.getElementById('modal-overlay').addEventListener('click', e => {
        if (e.target.id === 'modal-overlay') closeModal();
    });

    await loadCategories();
})();
