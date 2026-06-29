// ── Estado ──────────────────────────────────────────────────────────────────
let docentes = [];
let presentismo = {};     // docenteId → registro del mes seleccionado
let pendienteTotal = {};  // docenteId → suma de meses pendientes
let selectedIds = new Set();
let mesPlusCurrent, anioPlusCurrent;
let detalleDocenteId = null;
let pagoData = {};        // docenteId → [presentismo pendientes]
let pagoDocenteIds = [];

// ── Helpers ──────────────────────────────────────────────────────────────────
function estadoBadge(estado) {
    const map = {
        pendiente: '<span class="plus-badge pendiente">Pendiente</span>',
        pagado:    '<span class="plus-badge pagado">Pagado</span>',
        anulado:   '<span class="plus-badge anulado">Anulado</span>',
    };
    return map[estado] || '';
}

function openModal(id) {
    document.getElementById(id).classList.add('open');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('open');
    const form = document.querySelector(`#${id} form`);
    if (form) form.reset();
    const err = document.querySelector(`#${id} .error-msg`);
    if (err) err.style.display = 'none';
}

document.querySelectorAll('.modal-overlay').forEach(el => {
    el.addEventListener('click', e => { if (e.target === el) closeModal(el.id); });
});

// ── Carga de datos ──────────────────────────────────────────────────────────
async function loadAll() {
    await loadDocentes();
    await loadPresentismoMes();
    renderTabla();
    renderStats();
}

async function loadDocentes() {
    const { data } = await supabase
        .from('plus_docentes').select('*').order('nombre');
    docentes = data || [];
}

async function loadPresentismoMes() {
    if (!docentes.length) return;
    const ids = docentes.map(d => d.id);

    const { data: presMes } = await supabase
        .from('plus_presentismo')
        .select('*')
        .in('docente_id', ids)
        .eq('mes', mesPlusCurrent)
        .eq('anio', anioPlusCurrent);

    presentismo = {};
    for (const p of (presMes || [])) presentismo[p.docente_id] = p;

    const { data: pendAll } = await supabase
        .from('plus_presentismo')
        .select('docente_id, monto')
        .in('docente_id', ids)
        .eq('estado', 'pendiente');

    pendienteTotal = {};
    for (const p of (pendAll || [])) {
        pendienteTotal[p.docente_id] = (pendienteTotal[p.docente_id] || 0) + parseFloat(p.monto);
    }
}

// ── Render principal ────────────────────────────────────────────────────────
function renderTabla() {
    const search       = document.getElementById('buscador').value.toLowerCase();
    const showInactivos = document.getElementById('show-inactivos').checked;

    const filtered = docentes.filter(d =>
        (d.activo || showInactivos) &&
        d.nombre.toLowerCase().includes(search)
    );

    const tbody = document.getElementById('plus-tbody');
    if (!filtered.length) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-muted" style="text-align:center;padding:2rem">Sin docentes.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(d => {
        const pres     = presentismo[d.id];
        const estado   = pres ? estadoBadge(pres.estado) : '<span class="plus-badge sin-reg">Sin registro</span>';
        const total    = pendienteTotal[d.id] || 0;
        const checked  = selectedIds.has(d.id) ? 'checked' : '';
        const rowStyle = d.activo ? '' : 'style="opacity:.5"';
        const inactive = d.activo ? '' : ' <em style="font-size:.75rem;color:var(--muted)">(Inactivo)</em>';

        return `<tr ${rowStyle}>
            <td><input type="checkbox" class="doc-check" data-id="${d.id}" ${checked}></td>
            <td style="font-weight:500">${d.nombre}${inactive}</td>
            <td>${formatARS(d.monto_base)}</td>
            <td>${estado}</td>
            <td>${total > 0 ? formatARS(total) : '<span class="text-muted">—</span>'}</td>
            <td style="text-align:right;white-space:nowrap">
                <button class="btn btn-outline btn-sm" onclick="openDetalle('${d.id}')">Detalle</button>
                <button class="btn btn-outline btn-sm" style="margin-left:.3rem" onclick="openEditDocente('${d.id}')">Editar</button>
            </td>
        </tr>`;
    }).join('');

    document.querySelectorAll('.doc-check').forEach(cb => {
        cb.addEventListener('change', () => {
            if (cb.checked) selectedIds.add(cb.dataset.id);
            else selectedIds.delete(cb.dataset.id);
            updateBulkButtons();
        });
    });
}

function renderStats() {
    const activos = docentes.filter(d => d.activo).length;
    document.getElementById('stat-activos').textContent = activos;

    let pendMes = 0, pagMes = 0;
    for (const p of Object.values(presentismo)) {
        if (p.estado === 'pendiente') pendMes += parseFloat(p.monto);
        if (p.estado === 'pagado')    pagMes  += parseFloat(p.monto);
    }
    document.getElementById('stat-pendiente').textContent = formatARS(pendMes);
    document.getElementById('stat-pagado').textContent    = formatARS(pagMes);
}

function updateBulkButtons() {
    const any = selectedIds.size > 0;
    document.getElementById('btn-ajuste').disabled = !any;
    document.getElementById('btn-pagar').disabled  = !any;
}

// ── Generar mes ─────────────────────────────────────────────────────────────
document.getElementById('btn-generar-mes').addEventListener('click', async () => {
    const activos = docentes.filter(d => d.activo && !presentismo[d.id]);
    if (!activos.length) {
        alert('Todos los docentes activos ya tienen registro para este mes.');
        return;
    }
    if (!confirm(`¿Generar ${activos.length} registro(s) pendiente(s) para ${MESES[mesPlusCurrent-1]} ${anioPlusCurrent}?`)) return;

    const { error } = await supabase.from('plus_presentismo').insert(
        activos.map(d => ({
            docente_id: d.id,
            mes: mesPlusCurrent,
            anio: anioPlusCurrent,
            monto: d.monto_base,
            estado: 'pendiente'
        }))
    );
    if (error) { alert('Error al generar registros.'); return; }
    await loadAll();
});

// ── Docente CRUD ─────────────────────────────────────────────────────────────
document.getElementById('btn-nuevo-docente').addEventListener('click', () => {
    document.getElementById('doc-id').value = '';
    document.getElementById('modal-docente-title').textContent = 'Nuevo docente';
    document.getElementById('doc-fecha-alta').value = new Date().toISOString().split('T')[0];
    document.getElementById('doc-activo').checked = true;
    document.getElementById('activo-group').style.display = 'none';
    document.getElementById('docente-error').style.display = 'none';
    openModal('modal-docente');
});

function openEditDocente(id) {
    const d = docentes.find(x => x.id === id);
    if (!d) return;
    document.getElementById('doc-id').value          = d.id;
    document.getElementById('doc-nombre').value      = d.nombre;
    document.getElementById('doc-monto').value       = d.monto_base;
    document.getElementById('doc-fecha-alta').value  = d.fecha_alta;
    document.getElementById('doc-activo').checked    = d.activo;
    document.getElementById('modal-docente-title').textContent = 'Editar docente';
    document.getElementById('activo-group').style.display = '';
    document.getElementById('docente-error').style.display = 'none';
    openModal('modal-docente');
}

document.getElementById('form-docente').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-guardar-docente');
    btn.disabled = true;

    const id = document.getElementById('doc-id').value;
    const payload = {
        nombre:     document.getElementById('doc-nombre').value.trim(),
        monto_base: parseFloat(document.getElementById('doc-monto').value),
        fecha_alta: document.getElementById('doc-fecha-alta').value,
        activo:     document.getElementById('doc-activo').checked,
    };

    const { error } = id
        ? await supabase.from('plus_docentes').update(payload).eq('id', id)
        : await supabase.from('plus_docentes').insert(payload);

    btn.disabled = false;
    if (error) {
        console.error('Error al guardar docente:', error);
        showError('docente-error', error.message || 'Error al guardar.');
        return;
    }
    closeModal('modal-docente');
    await loadAll();
});

// ── Detalle docente ──────────────────────────────────────────────────────────
async function openDetalle(id) {
    detalleDocenteId = id;
    const d = docentes.find(x => x.id === id);
    document.getElementById('detalle-nombre').textContent = d.nombre;

    const [{ data: historial }, { data: ausencias }] = await Promise.all([
        supabase.from('plus_presentismo').select('*').eq('docente_id', id).order('anio').order('mes'),
        supabase.from('plus_ausencias').select('*').eq('docente_id', id).order('fecha')
    ]);

    let html = `<p style="font-size:.82rem;color:var(--muted);margin-bottom:1rem">
        Monto base: <strong>${formatARS(d.monto_base)}</strong> &nbsp;|&nbsp; Alta: ${d.fecha_alta}
    </p>`;

    if (historial?.length) {
        const totalPend = historial.filter(p => p.estado === 'pendiente').reduce((s,p) => s + parseFloat(p.monto), 0);
        html += `<div class="table-wrapper" style="margin-bottom:1.25rem">
            <div class="section-header">
                <span class="section-title">Presentismo mensual</span>
                ${totalPend > 0 ? `<span style="font-size:.82rem;color:var(--danger);font-weight:600">Pendiente: ${formatARS(totalPend)}</span>` : ''}
            </div>
            <table>
                <thead><tr><th>Período</th><th>Monto</th><th>Estado</th><th>Fecha pago</th></tr></thead>
                <tbody>
                ${historial.map(p => `
                    <tr>
                        <td>${MESES[p.mes-1]} ${p.anio}</td>
                        <td>${formatARS(p.monto)}</td>
                        <td>${estadoBadge(p.estado)}</td>
                        <td class="text-muted">${p.fecha_pago || '—'}</td>
                    </tr>`).join('')}
                </tbody>
            </table>
        </div>`;
    } else {
        html += `<p class="text-muted" style="margin-bottom:1rem">Sin registros de presentismo.</p>`;
    }

    if (ausencias?.length) {
        html += `<p style="font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);margin-bottom:.5rem">Ausencias registradas</p>`;
        html += `<div style="display:flex;flex-wrap:wrap;gap:.35rem;margin-bottom:.5rem">` +
            ausencias.map(a =>
                `<span style="background:#fef2f2;border:1px solid #fecaca;border-radius:.35rem;padding:.2rem .6rem;font-size:.82rem">${a.fecha}</span>`
            ).join('') + `</div>`;
    }

    document.getElementById('detalle-body').innerHTML = html;
    openModal('modal-detalle');
}

document.getElementById('btn-ausencia-detalle').addEventListener('click', () => {
    closeModal('modal-detalle');
    openAusencia(detalleDocenteId);
});

document.getElementById('btn-pagar-detalle').addEventListener('click', () => {
    closeModal('modal-detalle');
    openPago([detalleDocenteId]);
});

// ── Ausencia ─────────────────────────────────────────────────────────────────
function openAusencia(docenteId) {
    const d = docentes.find(x => x.id === docenteId);
    document.getElementById('ausencia-docente-id').value = docenteId;
    document.getElementById('ausencia-nombre').textContent = d?.nombre || '';
    document.getElementById('ausencia-fecha').value = new Date().toISOString().split('T')[0];
    document.getElementById('ausencia-error').style.display = 'none';
    openModal('modal-ausencia');
}

document.getElementById('form-ausencia').addEventListener('submit', async (e) => {
    e.preventDefault();
    const docenteId = document.getElementById('ausencia-docente-id').value;
    const fecha     = document.getElementById('ausencia-fecha').value;
    const partes    = fecha.split('-');
    const anio      = parseInt(partes[0]);
    const mes       = parseInt(partes[1]);

    if (!confirm(`¿Registrar ausencia el ${fecha} y anular el presentismo de ${MESES[mes-1]} ${anio}?`)) return;

    const { error: errAus } = await supabase.from('plus_ausencias')
        .insert({ docente_id: docenteId, fecha, mes, anio });
    if (errAus) {
        showError('ausencia-error', errAus.code === '23505' ? 'Ya existe una ausencia en esa fecha.' : 'Error al registrar.');
        return;
    }

    const d = docentes.find(x => x.id === docenteId);
    await supabase.from('plus_presentismo').upsert(
        { docente_id: docenteId, mes, anio, monto: d?.monto_base || 0, estado: 'anulado' },
        { onConflict: 'docente_id,mes,anio' }
    );

    closeModal('modal-ausencia');
    await loadAll();
});

// ── Ajuste masivo ─────────────────────────────────────────────────────────────
document.getElementById('btn-ajuste').addEventListener('click', () => {
    document.getElementById('ajuste-info').textContent =
        `${selectedIds.size} docente(s) seleccionado(s). Solo se modifican los registros pendientes desde el mes indicado.`;
    document.getElementById('ajuste-pct').value = '';

    const selMes  = document.getElementById('ajuste-desde-mes');
    const selAnio = document.getElementById('ajuste-desde-anio');
    selMes.innerHTML  = MESES.map((n,i) => `<option value="${i+1}"${i+1===mesPlusCurrent?' selected':''}>${n}</option>`).join('');
    selAnio.innerHTML = '';
    for (let y = getAnioActual() + 1; y >= 2020; y--) {
        const opt = document.createElement('option');
        opt.value = y; opt.textContent = y;
        if (y === anioPlusCurrent) opt.selected = true;
        selAnio.appendChild(opt);
    }
    openModal('modal-ajuste');
});

document.getElementById('form-ajuste').addEventListener('submit', async (e) => {
    e.preventDefault();
    const pct      = parseFloat(document.getElementById('ajuste-pct').value) / 100;
    const desdeMes = parseInt(document.getElementById('ajuste-desde-mes').value);
    const desdeAnio = parseInt(document.getElementById('ajuste-desde-anio').value);
    const desdeVal = desdeAnio * 12 + desdeMes;

    if (!confirm(`¿Aplicar +${document.getElementById('ajuste-pct').value}% a ${selectedIds.size} docente(s) desde ${MESES[desdeMes-1]} ${desdeAnio}?`)) return;

    const btn = document.querySelector('#form-ajuste [type="submit"]');
    btn.disabled = true;

    for (const id of selectedIds) {
        const d = docentes.find(x => x.id === id);
        if (!d) continue;
        const nuevoMonto = Math.round(d.monto_base * (1 + pct));
        await supabase.from('plus_docentes').update({ monto_base: nuevoMonto }).eq('id', id);

        const { data: pendPres } = await supabase
            .from('plus_presentismo').select('id, mes, anio, monto')
            .eq('docente_id', id).eq('estado', 'pendiente');

        for (const p of (pendPres || [])) {
            if (p.anio * 12 + p.mes >= desdeVal) {
                await supabase.from('plus_presentismo')
                    .update({ monto: Math.round(parseFloat(p.monto) * (1 + pct)) })
                    .eq('id', p.id);
            }
        }
    }

    btn.disabled = false;
    closeModal('modal-ajuste');
    selectedIds.clear();
    await loadAll();
    alert('Ajuste aplicado correctamente.');
});

// ── Pago ──────────────────────────────────────────────────────────────────────
async function openPago(ids) {
    pagoDocenteIds = ids;
    const nombre = ids.length === 1
        ? docentes.find(d => d.id === ids[0])?.nombre
        : `${ids.length} docentes`;
    document.getElementById('pago-titulo').textContent = `Registrar pago — ${nombre}`;
    document.getElementById('pago-error').style.display = 'none';

    pagoData = {};
    for (const id of ids) {
        const { data } = await supabase
            .from('plus_presentismo').select('*')
            .eq('docente_id', id).eq('estado', 'pendiente')
            .order('anio').order('mes');
        pagoData[id] = data || [];
    }

    renderPagoModal();
    openModal('modal-pago');
}

function renderPagoModal() {
    const hoy = new Date().toISOString().split('T')[0];
    let html = `<div style="margin-bottom:1rem;font-size:.88rem;color:var(--muted);display:flex;align-items:center;gap:.5rem">
        Fecha de pago:
        <input type="date" id="pago-fecha" value="${hoy}"
               style="border:1.5px solid var(--border);border-radius:.35rem;padding:.25rem .5rem;font-size:.85rem">
    </div>`;

    let hayPendientes = false;

    for (const id of pagoDocenteIds) {
        const d    = docentes.find(x => x.id === id);
        const pend = pagoData[id] || [];
        if (!pend.length) {
            html += `<p style="color:var(--muted);font-size:.85rem;margin-bottom:.5rem">${d?.nombre}: sin meses pendientes.</p>`;
            continue;
        }
        hayPendientes = true;
        if (pagoDocenteIds.length > 1) {
            html += `<p style="font-weight:600;font-size:.9rem;margin-bottom:.4rem">${d?.nombre}</p>`;
        }
        html += pend.map(p => `
            <label style="display:flex;align-items:center;gap:.6rem;padding:.35rem 0;cursor:pointer;border-bottom:1px solid var(--border)">
                <input type="checkbox" class="pago-check"
                    data-pres-id="${p.id}"
                    data-docente-id="${id}"
                    data-monto="${p.monto}"
                    data-mes="${p.mes}"
                    data-anio="${p.anio}"
                    checked>
                <span>${MESES[p.mes-1]} ${p.anio}</span>
                <span style="margin-left:auto;font-weight:600">${formatARS(p.monto)}</span>
            </label>`).join('');
        html += '<div style="margin-bottom:.75rem"></div>';
    }

    const totalInicial = Object.values(pagoData).flat().reduce((s,p) => s + parseFloat(p.monto), 0);
    html += `<div style="display:flex;justify-content:space-between;font-weight:700;font-size:1rem;padding:.75rem 0;border-top:2px solid var(--border);margin-top:.25rem">
        <span>Total</span>
        <span id="pago-total">${formatARS(totalInicial)}</span>
    </div>`;

    document.getElementById('pago-body').innerHTML = html;
    document.getElementById('btn-confirmar-pago').disabled = !hayPendientes;

    document.querySelectorAll('.pago-check').forEach(cb => {
        cb.addEventListener('change', recalcPagoTotal);
    });
}

function recalcPagoTotal() {
    let total = 0;
    document.querySelectorAll('.pago-check:checked').forEach(cb => {
        total += parseFloat(cb.dataset.monto);
    });
    document.getElementById('pago-total').textContent = formatARS(total);
}

document.getElementById('btn-confirmar-pago').addEventListener('click', async () => {
    const seleccionados = [...document.querySelectorAll('.pago-check:checked')];
    if (!seleccionados.length) { showError('pago-error', 'Seleccioná al menos un período.'); return; }

    const fechaPago = document.getElementById('pago-fecha').value;
    if (!fechaPago) { showError('pago-error', 'Ingresá la fecha de pago.'); return; }

    const btn = document.getElementById('btn-confirmar-pago');
    btn.disabled = true;

    // Agrupar por docente
    const byDocente = {};
    for (const cb of seleccionados) {
        const did = cb.dataset.docenteId;
        if (!byDocente[did]) byDocente[did] = [];
        byDocente[did].push({
            presId: cb.dataset.presId,
            monto:  parseFloat(cb.dataset.monto),
            mes:    parseInt(cb.dataset.mes),
            anio:   parseInt(cb.dataset.anio),
        });
    }

    const comprobantes = [];

    for (const [docenteId, meses] of Object.entries(byDocente)) {
        const montoTotal = meses.reduce((s,m) => s + m.monto, 0);

        const { data: pagoRec, error } = await supabase.from('plus_pagos')
            .insert({
                docente_id:  docenteId,
                meses:       meses.map(m => ({ mes: m.mes, anio: m.anio, monto: m.monto })),
                monto_total: montoTotal,
                fecha_pago:  fechaPago
            })
            .select().single();

        if (error) { showError('pago-error', 'Error al registrar el pago.'); btn.disabled = false; return; }

        for (const m of meses) {
            await supabase.from('plus_presentismo')
                .update({ estado: 'pagado', fecha_pago: fechaPago, pago_id: pagoRec.id })
                .eq('id', m.presId);
        }

        comprobantes.push({ docente: docentes.find(d => d.id === docenteId), pago: pagoRec, meses });
    }

    btn.disabled = false;
    closeModal('modal-pago');
    selectedIds.clear();
    await loadAll();
    imprimirComprobante(comprobantes, fechaPago);
});

// ── Comprobante ───────────────────────────────────────────────────────────────
function imprimirComprobante(comprobantes, fechaPago) {
    const fechaStr = new Date(fechaPago + 'T12:00:00').toLocaleDateString('es-AR', {
        day: '2-digit', month: 'long', year: 'numeric'
    });

    const html = comprobantes.map(({ docente, pago, meses }) => `
        <div class="comprobante-page">
            <div class="comp-header">
                <h1>Balance Condarco</h1>
                <h2>Comprobante de Presentismo</h2>
                <p>N° ${String(pago.comprobante_nro).padStart(4, '0')}</p>
            </div>
            <table class="comp-info">
                <tr><th>Docente</th><td>${docente.nombre}</td></tr>
                <tr><th>Fecha de pago</th><td>${fechaStr}</td></tr>
            </table>
            <h3 style="margin-bottom:.5rem;font-size:.95rem">Períodos abonados</h3>
            <table class="comp-detalle">
                <thead><tr><th>Período</th><th class="comp-total">Monto</th></tr></thead>
                <tbody>
                ${meses.map(m => `
                    <tr>
                        <td>${MESES[m.mes-1]} ${m.anio}</td>
                        <td class="comp-total">${formatARS(m.monto)}</td>
                    </tr>`).join('')}
                </tbody>
                <tfoot>
                    <tr>
                        <th>Total</th>
                        <th class="comp-total">${formatARS(meses.reduce((s,m)=>s+m.monto,0))}</th>
                    </tr>
                </tfoot>
            </table>
            <div class="comp-sello">
                <div class="comp-sello-box">
                    <p>Firma y sello</p>
                    <div class="comp-sello-rect"></div>
                </div>
            </div>
        </div>
    `).join('');

    document.getElementById('comprobante-content').innerHTML = html;
    document.getElementById('comprobante-wrapper').style.display = 'block';
    window.print();
    document.getElementById('comprobante-wrapper').style.display = 'none';
}

// ── Búsqueda y selección ──────────────────────────────────────────────────────
document.getElementById('buscador').addEventListener('input', renderTabla);
document.getElementById('show-inactivos').addEventListener('change', renderTabla);

document.getElementById('check-all').addEventListener('change', function () {
    const search        = document.getElementById('buscador').value.toLowerCase();
    const showInactivos = document.getElementById('show-inactivos').checked;
    const visible       = docentes.filter(d => (d.activo || showInactivos) && d.nombre.toLowerCase().includes(search));

    if (this.checked) visible.forEach(d => selectedIds.add(d.id));
    else visible.forEach(d => selectedIds.delete(d.id));

    renderTabla();
    updateBulkButtons();
});

document.getElementById('btn-pagar').addEventListener('click', () => {
    openPago([...selectedIds]);
});

// ── Selector de período ────────────────────────────────────────────────────────
function initPeriodSelector() {
    const selMes  = document.getElementById('sel-mes-plus');
    const selAnio = document.getElementById('sel-anio-plus');

    MESES.forEach((n, i) => {
        const opt = document.createElement('option');
        opt.value = i + 1; opt.textContent = n;
        if (i + 1 === mesPlusCurrent) opt.selected = true;
        selMes.appendChild(opt);
    });

    for (let y = getAnioActual() + 1; y >= 2020; y--) {
        const opt = document.createElement('option');
        opt.value = y; opt.textContent = y;
        if (y === anioPlusCurrent) opt.selected = true;
        selAnio.appendChild(opt);
    }

    selMes.addEventListener('change', () => { mesPlusCurrent = parseInt(selMes.value); loadAll(); });
    selAnio.addEventListener('change', () => { anioPlusCurrent = parseInt(selAnio.value); loadAll(); });

    document.getElementById('btn-prev-mes').addEventListener('click', () => {
        mesPlusCurrent--;
        if (mesPlusCurrent === 0) { mesPlusCurrent = 12; anioPlusCurrent--; }
        selMes.value = mesPlusCurrent; selAnio.value = anioPlusCurrent;
        loadAll();
    });
    document.getElementById('btn-next-mes').addEventListener('click', () => {
        mesPlusCurrent++;
        if (mesPlusCurrent === 13) { mesPlusCurrent = 1; anioPlusCurrent++; }
        selMes.value = mesPlusCurrent; selAnio.value = anioPlusCurrent;
        loadAll();
    });
}

// ── Init ──────────────────────────────────────────────────────────────────────
(async () => {
    if (!await initPage(true)) return;

    mesPlusCurrent  = getMesActual();
    anioPlusCurrent = getAnioActual();

    initPeriodSelector();
    await loadAll();
})();
