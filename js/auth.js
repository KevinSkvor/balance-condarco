let _profile = null;

async function initPage(requireAdmin = false) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { window.location.href = 'index.html'; return null; }

    const { data: profile, error: profileError } = await supabase
        .from('profiles').select('*').eq('id', session.user.id).single();

    if (profileError) console.error('Error al cargar perfil:', profileError);

    if (!profile) {
        console.error('No se encontró perfil para el usuario:', session.user.id);
        await supabase.auth.signOut();
        window.location.href = 'index.html';
        return null;
    }

    _profile = profile;

    if (requireAdmin && profile.role !== 'admin') {
        window.location.href = 'dashboard.html';
        return null;
    }

    const navUser = document.getElementById('nav-user');
    if (navUser) navUser.textContent = profile.full_name || session.user.email;

    const navBadge = document.getElementById('nav-badge');
    if (navBadge) {
        navBadge.textContent = profile.role === 'admin' ? 'Admin' : 'Usuario';
        navBadge.className   = `badge badge-${profile.role}`;
    }

    document.querySelectorAll('.admin-only').forEach(el => {
        el.style.display = profile.role === 'admin' ? '' : 'none';
    });

    document.getElementById('btn-logout')?.addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = 'index.html';
    });

    return { session, profile };
}
