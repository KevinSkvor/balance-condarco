let chartInstance = null;
let chartMode = 'line';
let chartMes, chartAnio;

function mesRange(mes, anio) {
    const pad = n => String(n).padStart(2, '0');
    const sigMes  = mes === 12 ? 1  : mes + 1;
    const sigAnio = mes === 12 ? anio + 1 : anio;
    return {
        desde: `${anio}-${pad(mes)}-01`,
        hasta: `${sigAnio}-${pad(sigMes)}-01`
    };
}

async function loadDashboard(mes, anio) {
    chartMes = mes; chartAnio = anio;
    document.getElementById('titulo-periodo').textContent = `${MESES[mes - 1]} ${anio}`;
    document.getElementById('link-agregar').href = `movements.html?mes=${mes}&anio=${anio}`;

    const { data: movements } = await supabase
        .from('movements')
        .select('*, categories(name)')
        .eq('month', mes)
        .eq('year', anio);

    const { data: plusData } = await supabase
        .from('plus_presentismo').select('monto')
        .eq('mes', mes).eq('anio', anio).eq('estado', 'pagado');
    const plusMes = (plusData || []).reduce((s, p) => s + parseFloat(p.monto), 0);

    const totals = { ingreso: 0, ingreso_extra: 0, blanco: 0, negro: 0, personal: 0 };
    for (const m of (movements || [])) {
        totals[m.block] = (totals[m.block] || 0) + parseFloat(m.amount);
    }
    totals.negro += plusMes;

    const totalIngresos = totals.ingreso + totals.ingreso_extra;
    const totalGastos   = totals.blanco + totals.negro + totals.personal;
    const neto          = totalIngresos - totalGastos;

    document.getElementById('total-ingresos').textContent = formatARS(totalIngresos);
    document.getElementById('total-blanco').textContent   = formatARS(totals.blanco);
    document.getElementById('total-negro').textContent    = formatARS(totals.negro);
    document.getElementById('total-personal').textContent = formatARS(totals.personal);

    const netoEl = document.getElementById('total-neto');
    netoEl.textContent = formatARS(neto);
    netoEl.className   = `card-amount ${neto >= 0 ? 'positive' : 'negative'}`;

    await loadChart(mes, anio);

    if (_profile?.role === 'admin') renderDesglose(movements || [], plusMes);
}

async function loadChart(mesActual, anioActual) {
    const periodos = [];
    let m = mesActual, a = anioActual;
    for (let i = 0; i < 12; i++) {
        periodos.unshift({ mes: m, anio: a });
        m--;
        if (m === 0) { m = 12; a--; }
    }

    const years = [...new Set(periodos.map(p => p.anio))];
    const { data: allMovs } = await supabase
        .from('movements')
        .select('amount, block, month, year')
        .in('year', years);

    const { data: allPlus } = await supabase
        .from('plus_presentismo').select('mes, anio, monto')
        .in('anio', years).eq('estado', 'pagado');

    const plusPorMes = (mes, anio) =>
        (allPlus || [])
            .filter(p => p.mes === mes && p.anio === anio)
            .reduce((s, p) => s + parseFloat(p.monto), 0);

    const movs   = allMovs || [];
    const labels = periodos.map(p => `${MESES[p.mes - 1].slice(0, 3)} ${p.anio}`);

    const ctx = document.getElementById('chart-evolucion').getContext('2d');
    if (chartInstance) chartInstance.destroy();

    const tickCallback = v => {
        const abs = Math.abs(v);
        if (abs >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
        if (abs >= 1000)    return `$${(v / 1000).toFixed(0)}K`;
        return `$${v}`;
    };

    if (chartMode === 'line') {
        const values = periodos.map(({ mes, anio }) => {
            let ing = 0, gast = 0;
            for (const mv of movs.filter(mv => mv.month === mes && mv.year === anio)) {
                const amt = parseFloat(mv.amount);
                if (mv.block === 'ingreso' || mv.block === 'ingreso_extra') ing += amt;
                else gast += amt;
            }
            gast += plusPorMes(mes, anio);
            return ing - gast;
        });

        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Resultado neto',
                    data: values,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37,99,235,.08)',
                    fill: true,
                    tension: .35,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: { callbacks: { label: c => formatARS(c.raw) } }
                },
                scales: { y: { ticks: { callback: tickCallback } } }
            }
        });
    } else {
        const getBlock = (bl) => periodos.map(({ mes, anio }) =>
            movs.filter(mv => mv.month === mes && mv.year === anio && mv.block === bl)
                .reduce((s, mv) => s + parseFloat(mv.amount), 0)
        );

        chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Ingresos',
                        data: periodos.map(({ mes, anio }) =>
                            movs.filter(mv => mv.month === mes && mv.year === anio && (mv.block === 'ingreso' || mv.block === 'ingreso_extra'))
                                .reduce((s, mv) => s + parseFloat(mv.amount), 0)
                        ),
                        backgroundColor: 'rgba(22,163,74,.75)', borderColor: '#16a34a', borderWidth: 1
                    },
                    { label: 'Gastos en Blanco',  data: getBlock('blanco'),   backgroundColor: 'rgba(37,99,235,.75)',  borderColor: '#2563eb', borderWidth: 1 },
                    { label: 'Gastos en Negro',   data: periodos.map(({ mes, anio }) =>
                            movs.filter(mv => mv.month === mes && mv.year === anio && mv.block === 'negro')
                                .reduce((s, mv) => s + parseFloat(mv.amount), 0) + plusPorMes(mes, anio)),
                        backgroundColor: 'rgba(51,65,85,.75)', borderColor: '#334155', borderWidth: 1 },
                    { label: 'Gastos Personales', data: getBlock('personal'), backgroundColor: 'rgba(124,58,237,.75)', borderColor: '#7c3aed', borderWidth: 1 }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
                    tooltip: { callbacks: { label: c => `${c.dataset.label}: ${formatARS(c.raw)}` } }
                },
                scales: { y: { ticks: { callback: tickCallback } } }
            }
        });
    }
}

async function loadSavings() {
    const fromMes  = parseInt(document.getElementById('sav-from-mes').value);
    const fromAnio = parseInt(document.getElementById('sav-from-anio').value);
    const toMes    = parseInt(document.getElementById('sav-to-mes').value);
    const toAnio   = parseInt(document.getElementById('sav-to-anio').value);

    const fromVal = fromAnio * 12 + fromMes;
    const toVal   = toAnio  * 12 + toMes;
    if (fromVal > toVal) return;

    const years = [];
    for (let y = fromAnio; y <= toAnio; y++) years.push(y);

    const { data } = await supabase
        .from('movements')
        .select('amount, block, month, year')
        .in('year', years);

    const { data: plusRango } = await supabase
        .from('plus_presentismo').select('mes, anio, monto')
        .in('anio', years).eq('estado', 'pagado');
    const plusAcum = (plusRango || []).filter(p => {
        const val = p.anio * 12 + p.mes;
        return val >= fromVal && val <= toVal;
    }).reduce((s, p) => s + parseFloat(p.monto), 0);

    let ing = 0, gast = 0;
    for (const mv of (data || [])) {
        const val = mv.year * 12 + mv.month;
        if (val < fromVal || val > toVal) continue;
        const amt = parseFloat(mv.amount);
        if (mv.block === 'ingreso' || mv.block === 'ingreso_extra') ing += amt;
        else gast += amt;
    }
    gast += plusAcum;

    const neto = ing - gast;
    document.getElementById('sav-ingresos').textContent = formatARS(ing);
    document.getElementById('sav-gastos').textContent   = formatARS(gast);
    const netoEl = document.getElementById('sav-neto');
    netoEl.textContent = formatARS(neto);
    netoEl.className   = `savings-amount ${neto >= 0 ? 'positive' : 'negative'}`;
}

function renderDesglose(movements, plusMes) {
    const bloques = ['ingreso', 'ingreso_extra', 'blanco', 'negro', 'personal'];
    let html = '';

    for (const bloque of bloques) {
        const movs = movements.filter(m => m.block === bloque);
        const esNegro = bloque === 'negro';
        if (!movs.length && !(esNegro && plusMes > 0)) continue;

        const total = movs.reduce((s, m) => s + parseFloat(m.amount), 0) + (esNegro ? plusMes : 0);

        const filaPlus = esNegro && plusMes > 0
            ? `<tr>
                <td style="font-weight:600">PLUS — Presentismo</td>
                <td class="text-muted">Pago automático desde PLUS</td>
                <td class="amount">${formatARS(plusMes)}</td>
               </tr>`
            : '';

        html += `
        <div class="table-wrapper">
            <div class="section-header">
                <span class="section-title"><span class="dot dot-${bloque}"></span>${BLOQUES_LABEL[bloque]}</span>
                <span class="section-total">${formatARS(total)}</span>
            </div>
            <table>
                <thead><tr><th>Categoría</th><th>Descripción</th><th class="amount-header">Monto</th></tr></thead>
                <tbody>
                ${movs.map(m => `
                    <tr>
                        <td>${m.categories?.name || '—'}</td>
                        <td class="text-muted">${m.description || '—'}</td>
                        <td class="amount">${formatARS(m.amount)}</td>
                    </tr>`).join('')}
                ${filaPlus}
                </tbody>
            </table>
        </div>`;
    }

    document.getElementById('section-desglose').innerHTML = html;
}

(async () => {
    if (!await initPage()) return;

    let { mes, anio } = getParams();
    const selMes  = document.getElementById('sel-mes');
    const selAnio = document.getElementById('sel-anio');

    MESES.forEach((nombre, i) => {
        const opt = document.createElement('option');
        opt.value = i + 1; opt.textContent = nombre;
        if (i + 1 === mes) opt.selected = true;
        selMes.appendChild(opt);
    });

    for (let y = getAnioActual() + 1; y >= 2020; y--) {
        const opt = document.createElement('option');
        opt.value = y; opt.textContent = y;
        if (y === anio) opt.selected = true;
        selAnio.appendChild(opt);
    }

    function refresh() {
        mes  = parseInt(selMes.value);
        anio = parseInt(selAnio.value);
        setParams(mes, anio);
        loadDashboard(mes, anio);
    }

    selMes.addEventListener('change', refresh);
    selAnio.addEventListener('change', refresh);

    document.getElementById('btn-prev').addEventListener('click', () => {
        mes--; if (mes === 0) { mes = 12; anio--; }
        selMes.value = mes; selAnio.value = anio; refresh();
    });
    document.getElementById('btn-next').addEventListener('click', () => {
        mes++; if (mes === 13) { mes = 1; anio++; }
        selMes.value = mes; selAnio.value = anio; refresh();
    });

    // Chart toggle
    document.getElementById('btn-chart-linea').addEventListener('click', function() {
        chartMode = 'line';
        this.classList.add('active');
        document.getElementById('btn-chart-barras').classList.remove('active');
        if (chartMes) loadChart(chartMes, chartAnio);
    });
    document.getElementById('btn-chart-barras').addEventListener('click', function() {
        chartMode = 'bar';
        this.classList.add('active');
        document.getElementById('btn-chart-linea').classList.remove('active');
        if (chartMes) loadChart(chartMes, chartAnio);
    });

    // Savings period selectors
    const savFromMes  = document.getElementById('sav-from-mes');
    const savFromAnio = document.getElementById('sav-from-anio');
    const savToMes    = document.getElementById('sav-to-mes');
    const savToAnio   = document.getElementById('sav-to-anio');

    MESES.forEach((nombre, i) => {
        [savFromMes, savToMes].forEach(sel => {
            const opt = document.createElement('option');
            opt.value = i + 1; opt.textContent = nombre;
            sel.appendChild(opt);
        });
    });

    for (let y = getAnioActual() + 1; y >= 2020; y--) {
        [savFromAnio, savToAnio].forEach(sel => {
            const opt = document.createElement('option');
            opt.value = y; opt.textContent = y;
            sel.appendChild(opt);
        });
    }

    savFromMes.value  = 1;
    savFromAnio.value = getAnioActual();
    savToMes.value    = getMesActual();
    savToAnio.value   = getAnioActual();

    [savFromMes, savFromAnio, savToMes, savToAnio].forEach(sel => {
        sel.addEventListener('change', loadSavings);
    });

    await loadDashboard(mes, anio);
    loadSavings();
})();
