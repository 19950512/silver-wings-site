class GuildPlayers {
  constructor(config) {
    this.apiUrl = config.apiUrl;
    this.playersList = document.getElementById(config.playersListId);
    this.loadingElement = document.getElementById(config.loadingId);

    this.statusFilter = document.getElementById(config.statusFilterId);
    this.vocationFilter = document.getElementById(config.vocationFilterId);
    this.rankFilter = document.getElementById(config.rankFilterId);

    this.playersData = [];
    this.currentIndex = 0;
    this.playersPerLoad = 20;
    this.loadingThreshold = 300;

    this.init();
  }

  async init() {
    await this.fetchPlayers();
    this.addFilterListeners();
    this.setupScrollListener();
  }

  async fetchPlayers() {
    try {
      const response = await fetch(this.apiUrl);
      const data = await response.json();
      this.playersData = data.guild.members;

      this.populateRankFilter();

      this.loadMorePlayers();

      // Exibir totais
      this.showTotals(data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      this.playersList.innerHTML =
        '<p class="text-center text-red-400 text-2xl">Erro ao carregar a lista de jogadores.</p>';
    }
  }

  populateRankFilter() {
    const uniqueRanks = [...new Set(this.playersData.map(player => player.rank))];
    uniqueRanks.forEach(rank => {
      const option = document.createElement('option');
      option.value = rank;
      option.textContent = rank;
      this.rankFilter.appendChild(option);
    });
  }

  showTotals(data) {
    const totalOnline = document.createElement('p');
    totalOnline.className = 'text-center text-slate-400 mt-8 text-lg';
    totalOnline.textContent =
      `Jogadores Online: ${data.guild.players_online} | Offline: ${data.guild.players_offline} | Total: ${data.guild.members_total}`;
    document.body.appendChild(totalOnline);

    const updateTime = document.createElement('p');
    updateTime.className = 'text-center text-slate-500 mt-2 mb-8';
    updateTime.textContent = 'Última atualização: ' + new Date().toLocaleString('pt-BR');
    document.body.appendChild(updateTime);
  }

  getBackgroundByVocation(vocation) {
    switch (vocation) {
      case "Master Sorcerer": case "Sorcerer": return "assets/images/bg-sorcerer.png";
      case "Elder Druid": case "Druid": return "assets/images/bg-druid.png";
      case "Royal Paladin": case "Paladin": return "assets/images/bg-paladin.png";
      case "Elite Knight": case "Knight": return "assets/images/bg-knight.png";
      case "Exalted Monk": case "Monk": return "assets/images/bg-monk.webp";
      default: return "assets/images/bg-default.jpg";
    }
  }

  loadMorePlayers(filteredPlayers = this.playersData) {
    this.loadingElement.classList.remove('hidden');

    const endIndex = this.currentIndex + this.playersPerLoad;
    const playersToLoad = filteredPlayers.slice(this.currentIndex, endIndex);

    playersToLoad.forEach((player, index) => {
      const statusColor = player.status === 'online' ? 'bg-green-500' : 'bg-red-500';
      const bgImage = this.getBackgroundByVocation(player.vocation);

      const playerCard = document.createElement('div');
      playerCard.className = `
        player-card relative p-5 rounded-2xl shadow-xl border border-indigo-700/40 
        hover:border-indigo-400 hover:shadow-indigo-700/30 transition-all duration-300 fade-in overflow-hidden
      `;
      playerCard.style.animationDelay = `${index * 0.05}s`;
      playerCard.style.backgroundImage = `url('${bgImage}')`;
      playerCard.style.backgroundSize = "contain";
      playerCard.style.backgroundPosition = "right";
      playerCard.style.backgroundRepeat = "no-repeat";
      
        if(player.status === 'online') {
            playerCard.classList.add('online-glow');
        }

      playerCard.innerHTML = `
        <div class="absolute top-3 right-3 w-3 h-3 rounded-full ${statusColor} shadow-md"></div>
        <div class="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80"></div>
        <div class="relative z-10">
          <h3 class="text-xl font-bold text-slate-100 mb-2 drop-shadow">
            <a href="player.html?name=${encodeURIComponent(player.name)}" class="hover:text-indigo-300 transition">${player.name}</a>
          </h3>
          <p class="text-slate-300 text-sm">Rank: <span class="text-indigo-200">${player.rank}</span></p>
          <p class="text-slate-300 text-sm">Vocation: <span class="text-indigo-200">${player.vocation}</span></p>
          <p class="text-slate-300 text-sm">Level: <span class="text-indigo-200">${player.level}</span></p>
          <p class="text-slate-300 text-sm">Joined: <span class="text-indigo-200">${new Date(player.joined).toLocaleDateString('pt-BR')}</span></p>
        </div>
      `;
      this.playersList.appendChild(playerCard);
    });

    this.currentIndex = endIndex;
    this.loadingElement.classList.add('hidden');

    if (this.currentIndex >= filteredPlayers.length) {
      window.removeEventListener('scroll', this.handleScrollBound);
    }
  }

  setupScrollListener() {
    this.handleScrollBound = this.handleScroll.bind(this);
    window.addEventListener('scroll', this.handleScrollBound);
  }

  handleScroll() {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (scrollHeight - scrollTop - clientHeight < this.loadingThreshold && this.currentIndex < this.playersData.length) {
      const filteredPlayers = this.applyFiltersLogic();
      this.loadMorePlayers(filteredPlayers);
    }
  }

  applyFiltersLogic() {
    const statusFilter = this.statusFilter.value;
    const vocationFilter = this.vocationFilter.value;
    const rankFilter = this.rankFilter.value;

    let filteredPlayers = this.playersData;

    if (statusFilter !== 'all') filteredPlayers = filteredPlayers.filter(p => p.status === statusFilter);
    if (vocationFilter !== 'all') filteredPlayers = filteredPlayers.filter(p => p.vocation === vocationFilter);
    if (rankFilter !== 'all') filteredPlayers = filteredPlayers.filter(p => p.rank === rankFilter);

    return filteredPlayers;
  }

  applyFilters() {
    this.currentIndex = 0;
    this.playersList.innerHTML = '';
    const filteredPlayers = this.applyFiltersLogic();
    this.loadMorePlayers(filteredPlayers);
    this.setupScrollListener();
  }

  addFilterListeners() {
    this.statusFilter.addEventListener('change', () => this.applyFilters());
    this.vocationFilter.addEventListener('change', () => this.applyFilters());
    this.rankFilter.addEventListener('change', () => this.applyFilters());
  }
}