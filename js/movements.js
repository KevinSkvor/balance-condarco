let allCategories = [];
let currentMes, currentAnio;

async function loadCategories() {
    const { data } = await supabase
        .from('categories').select('*').eq('active', true).order('sort_order');
    allCategories = data || [];
}

async function loadMovements(mes, anio) {
    const container = document.getElementById('movements-container');
    container.innerHTML = '<p class="text-muted" style="text-align:center;padding:2rem">Cargando...</p>';

    const { data: movements, error } = await supabase
        .from('movements')
        .select('*, categories(name)')
        .eq('month', mes).eq('year', anio);

    if (error) {
        container.innerHTML = '<p class="text-muted" style="text-align:center;padding:2rem">Error al cargar.</p>';
        return;
    }

    const isAdmin = _profile?.role === 'admin';
    let profileNames = {};
    if (isAdmin && movements?.length) {
        const ids = [...new Set(movements.map(m => m.created_by))];
        const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', ids);
        for (const p of (profiles || [])) profileNames[p.id] = p.full_name || p.id;
    }

    const movByCategory = {};
    for (const m of (movements || [])) movByCategory[m.category_id] = m;

    const bloques = ['ingreso', 'ingreso_extra', 'blanco', 'negro', 'personal'];
    let html = '';

    for (const bloque of bloques) {
        const cats = allCategories.filter(c => c.block === bloque);
        if (!cats.length) continue;

        const blockTotal = cats.reduce((s, c) => {
            const m = movByCategory[c.id];
            return s + (m ? parseFloat(m.amount) : 0);
        }, 0);
        const doneCount = cats.filter(c => movByCategory[c.id]).length;

        html += `
        <div class="table-wrapper">
            <div class="section-header">
                <span class="section-title">
                    <span class="dot dot-${bloque}"></span>${BLOQUES_LABEL[bloque]}
                    <span style="font-weight:400;font-size:.76rem;color:var(--muted);margin-left:.4rem">${doneCount}/${cats.length}</span>
                </span>
                <span class="section-total">${blockTotal > 0 ? formatARS(blockTotal) : '—'}</span>
            </div>
            <table>
                <thead><tr>
                    <th style="width:1.5rem;padding-right:.25rem"></th>
                    <th>Categoría</th>
                    <th>Descripción</th>
                    ${isAdmin ? '<th>Cargado por</th>' : ''}
                    <th class="amount-header">Monto</th>
                    <th></th>
                </tr></thead>
                <tbody>
                ${cats.map(cat => {
                    const m = movByCategory[cat.id];
                    if (m) {
                        const puedo = isAdmin || m.created_by === _profile?.id;
                        return `<tr style="background:#f0fdf4">
                            <td style="color:var(--success);font-weight:700;padding-right:.25rem">✓</td>
                            <td>${cat.name}</td>
                            <td class="text-muted">${m.description || '—'}</td>
                            ${isAdmin ? `<td class="text-muted">${profileNames[m.created_by] || '—'}</td>` : ''}
                            <td class="amount">${formatARS(m.amount)}</td>
                            <td style="text-align:right;white-space:nowrap">
                                ${puedo ? `
                                    <button class="btn btn-outline btn-sm" onclick="openEdit('${m.id}')">Editar</button>
                                    <button class="btn btn-danger btn-sm" style="margin-left:.3rem" onclick="deleteMovement('${m.id}')">Borrar</button>
                                ` : ''}
                            </td>
                        </tr>`;
                    } else {
                        return `<tr>
                            <td style="color:#cbd5e1;padding-right:.25rem">○</td>
                            <td class="text-muted">${cat.name}</td>
                            <td></td>
                            ${isAdmin ? '<td></td>' : ''}
                            <td></td>
                            <td style="text-align:right">
                                <button class="btn btn-outline btn-sm" onclick="openAddWithCategory('${cat.id}','${bloque}')">+ Registrar</button>
                            </td>
                        </tr>`;
                    }
                }).join('')}
                </tbody>
            </table>
        </div>`;
    }

    container.innerHTML = html || '<p class="text-muted" style="text-align:center;padding:2rem">No hay categorías activas.</p>';
}

// ── Modal ─────────────────────────────────────────────────────────────────
function openModal(title) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('form-error').style.display = 'none';
    document.getElementById('modal-overlay').classList.add('open');
}

function closeModal() {
    document.getElementById('modal-overlay').classList.remove('open');
    document.getElementById('movement-form').reset();
    document.getElementById('mv-id').value = '';
    document.getElementById('mv-category').innerHTML = '<option value="">Primero elegí un bloque</option>';
}

function openAdd() {
    closeModal();
    document.getElementById('mv-mes').value  = currentMes;
    document.getElementById('mv-anio').value = currentAnio;
    openModal('Agregar movimiento');
}

function openAddWithCategory(categoryId, block) {
    closeModal();
    document.getElementById('mv-mes').value   = currentMes;
    document.getElementById('mv-anio').value  = currentAnio;
    document.getElementById('mv-block').value = block;
    populateCategorySelect(block, categoryId);
    openModal('Registrar movimiento');
}

async function openEdit(id) {
    const { data: m } = await supabase.from('movements').select('*').eq('id', id).single();
    if (!m) return;
    document.getElementById('mv-id').value     = m.id;
    document.getElementById('mv-amount').value = m.amount;
    document.getElementById('mv-mes').value    = m.month;
    document.getElementById('mv-anio').value   = m.year;
    document.getElementById('mv-desc').value   = m.description || '';
    document.getElementById('mv-block').value  = m.block;
    populateCategorySelect(m.block, m.category_id);
    openModal('Editar movimiento');
}

function populateCategorySelect(block, selectedId = null) {
    const cats = allCategories.filter(c => c.block === block);
    const sel  = document.getElementById('mv-category');
    sel.innerHTML = cats.length
        ? cats.map(c => `<option value="${c.id}"${c.id === selectedId ? ' selected' : ''}>${c.name}</option>`).join('')
        : '<option value="">Sin categorías en este bloque</option>';
}

document.getElementById('mv-block').addEventListener('change', e => populateCategorySelect(e.target.value));

// ── Save ──────────────────────────────────────────────────────────────────
document.getElementById('movement-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-save');
    btn.disabled = true; btn.textContent = 'Guardando...';

    const id          = document.getElementById('mv-id').value;
    const category_id = document.getElementById('mv-category').value;
    const block       = document.getElementById('mv-block').value;
    const amount      = parseFloat(document.getElementById('mv-amount').value);
    const month       = parseInt(document.getElementById('mv-mes').value);
    const year        = parseInt(document.getElementById('mv-anio').value);
    const description = document.getElementById('mv-desc').value.trim() || null;

    const payload = { category_id, block, amount, month, year, description };

    let error;
    if (id) {
        ({ error } = await supabase.from('movements').update(payload).eq('id', id));
    } else {
        const { data: { user } } = await supabase.auth.getUser();
        payload.created_by = user.id;
        ({ error } = await supabase.from('movements').insert(payload));
    }

    btn.disabled = false; btn.textContent = 'Guardar';

    if (error) {
        if (error.code === '23505') {
            showError('form-error', 'Esta categoría ya tiene un registro para este mes.');
        } else {
            showError('form-error', 'Error al guardar. Revisá los datos.');
        }
        return;
    }
    closeModal();
    loadMovements(currentMes, currentAnio);
});

async function deleteMovement(id) {
    if (!confirm('¿Eliminar este movimiento?')) return;
    const { error } = await supabase.from('movements').delete().eq('id', id);
    if (error) { alert('No se pudo eliminar el movimiento.'); return; }
    loadMovements(currentMes, currentAnio);
}

// ── Init ──────────────────────────────────────────────────────────────────
(async () => {
    if (!await initPage()) return;
    await loadCategories();

    let { mes, anio } = getParams();
    currentMes = mes; currentAnio = anio;

    const selMes  = document.getElementById('sel-mes');
    const selAnio = document.getElementById('sel-anio');
    const mvMes   = document.getElementById('mv-mes');
    const mvAnio  = document.getElementById('mv-anio');

    MESES.forEach((nombre, i) => {
        [selMes, mvMes].forEach(sel => {
            const opt = document.createElement('option');
            opt.value = i + 1; opt.textContent = nombre;
            if (i + 1 === mes) opt.selected = true;
            sel.appendChild(opt);
        });
    });

    for (let y = getAnioActual() + 1; y >= 2020; y--) {
        [selAnio, mvAnio].forEach(sel => {
            const opt = document.createElement('option');
            opt.value = y; opt.textContent = y;
            if (y === anio) opt.selected = true;
            sel.appendChild(opt);
        });
    }

    function refresh() {
        currentMes  = parseInt(selMes.value);
        currentAnio = parseInt(selAnio.value);
        setParams(currentMes, currentAnio);
        loadMovements(currentMes, currentAnio);
    }

    selMes.addEventListener('change', refresh);
    selAnio.addEventListener('change', refresh);
    document.getElementById('btn-prev').addEventListener('click', () => {
        currentMes--; if (currentMes === 0) { currentMes = 12; currentAnio--; }
        selMes.value = currentMes; selAnio.value = currentAnio; refresh();
    });
    document.getElementById('btn-next').addEventListener('click', () => {
        currentMes++; if (currentMes === 13) { currentMes = 1; currentAnio++; }
        selMes.value = currentMes; selAnio.value = currentAnio; refresh();
    });

    document.getElementById('btn-agregar').addEventListener('click', openAdd);
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-cancel').addEventListener('click', closeModal);
    document.getElementById('modal-overlay').addEventListener('click', e => {
        if (e.target.id === 'modal-overlay') closeModal();
    });

    await loadMovements(mes, anio);
})();
