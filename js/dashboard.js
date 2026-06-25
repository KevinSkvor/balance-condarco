let chartInstance = null;

async function loadDashboard(mes, anio) {
    document.getElementById('titulo-periodo').textContent = `${MESES[mes - 1]} ${anio}`;
    document.getElementById('link-agregar').href = `movements.html?mes=${mes}&anio=${anio}`;

    const { data: movements } = await supabase
        .from('movements')
        .select('*, categories(name)')
        .eq('month', mes)
        .eq('year', anio);

    const totals = { ingreso: 0, ingreso_extra: 0, blanco: 0, negro: 0, personal: 0 };
    for (const m of (movements || [])) {
        totals[m.block] = (totals[m.block] || 0) + parseFloat(m.amount);
    }

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

    if (_profile?.role === 'admin') renderDesglose(movements || []);
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

    const movs   = allMovs || [];
    const labels = periodos.map(p => `${MESES[p.mes - 1].slice(0, 3)} ${p.anio}`);
    const values = periodos.map(({ mes, anio }) => {
        let ing = 0, gast = 0;
        for (const mv of movs.filter(mv => mv.month === mes && mv.year === anio)) {
            const amt = parseFloat(mv.amount);
            if (mv.block === 'ingreso' || mv.block === 'ingreso_extra') ing += amt;
            else gast += amt;
        }
        return ing - gast;
    });

    const ctx = document.getElementById('chart-evolucion').getContext('2d');
    if (chartInstance) chartInstance.destroy();

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
            scales: {
                y: {
                    ticks: {
                        callback: v => {
                            const abs = Math.abs(v);
                            if (abs >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
                            if (abs >= 1000)    return `$${(v / 1000).toFixed(0)}K`;
                            return `$${v}`;
                        }
                    }
                }
            }
        }
    });
}

function renderDesglose(movements) {
    const bloques = ['ingreso', 'ingreso_extra', 'blanco', 'negro', 'personal'];
    let html = '';

    for (const bloque of bloques) {
        const movs = movements.filter(m => m.block === bloque);
        if (!movs.length) continue;
        const total = movs.reduce((s, m) => s + parseFloat(m.amount), 0);

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

    await loadDashboard(mes, anio);
})();
