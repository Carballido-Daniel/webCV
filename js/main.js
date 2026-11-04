// Desplegables de experiencia, "expandir todo", nav activa y animaciones de entrada.
(() => {
  const jobs = [...document.querySelectorAll('.job')];
  const toggleAll = document.getElementById('toggle-all');

  const setOpen = (job, open) => {
    job.classList.toggle('is-open', open);
    job.querySelector('.job__head').setAttribute('aria-expanded', String(open));
  };

  const syncToggleAll = () => {
    const allOpen = jobs.every(j => j.classList.contains('is-open'));
    toggleAll.textContent = allOpen ? 'Contraer todo' : 'Expandir todo';
    toggleAll.setAttribute('aria-pressed', String(allOpen));
  };

  jobs.forEach((job, i) => {
    const head = job.querySelector('.job__head');
    const body = job.querySelector('.job__body');
    const id = `job-body-${i}`;
    body.id = id;
    head.setAttribute('aria-controls', id);
    head.addEventListener('click', () => {
      setOpen(job, !job.classList.contains('is-open'));
      syncToggleAll();
    });
  });

  toggleAll.addEventListener('click', () => {
    const open = !jobs.every(j => j.classList.contains('is-open'));
    jobs.forEach(j => setOpen(j, open));
    syncToggleAll();
  });

  // El empleo actual se muestra abierto al cargar
  const current = document.querySelector('.job.is-current');
  if (current) setOpen(current, true);
  syncToggleAll();

  // Al imprimir, todo desplegado
  window.addEventListener('beforeprint', () => jobs.forEach(j => setOpen(j, true)));

  // Animación de entrada
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('is-visible'));
  }

  // Enlace activo en la navegación
  const links = [...document.querySelectorAll('.nav a')];
  const sections = links.map(a => document.querySelector(a.getAttribute('href')));
  const navIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === `#${e.target.id}`));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => s && navIO.observe(s));

  document.getElementById('year').textContent = new Date().getFullYear();
})();
