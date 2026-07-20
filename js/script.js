    const carte = echarts.init(document.getElementById('carte'));

    const BASE = location.hostname === 'localhost' ? '' : '/Carte-De-Chine-Geopo';

    const ZOOM_INITIAL = 4.0;
    const CENTRE       = [105, 35];
    // Limites de déplacement (longitude min/max, latitude min/max)
    const LIMITES = { lonMin: 60, lonMax: 150, latMin: 5, latMax: 60 };
    let zoomActuel = ZOOM_INITIAL;

    const paysAsie = [
      'China', 'Russia', 'Mongolia', 'Kazakhstan', 'Kyrgyzstan',
      'Tajikistan', 'Afghanistan', 'Pakistan', 'India', 'Nepal', 'Brunei',
      'Bhutan', 'Bangladesh', 'Myanmar', 'Laos', 'Vietnam', 'Iran', '台湾省',
      'Thailand', 'Cambodia', 'Malaysia', 'North Korea', 'South Korea',
      'Japan', 'Philippines', 'Uzbekistan', 'Turkmenistan', 'Singapore','Indonesia'
    ];

    const traductionProvinces = {
      "北京市":           "Pékin",
      "天津市":           "Tianjin",
      "上海市":           "Shanghai",
      "重庆市":           "Chongqing",
      "河北省":           "Hebei",
      "山西省":           "Shanxi",
      "辽宁省":           "Liaoning",
      "吉林省":           "Jilin",
      "黑龙江省":         "Heilongjiang",
      "江苏省":           "Jiangsu",
      "浙江省":           "Zhejiang",
      "安徽省":           "Anhui",
      "福建省":           "Fujian",
      "江西省":           "Jiangxi",
      "山东省":           "Shandong",
      "河南省":           "Henan",
      "湖北省":           "Hubei",
      "湖南省":           "Hunan",
      "广东省":           "Guangdong",
      "海南省":           "Hainan",
      "四川省":           "Sichuan",
      "贵州省":           "Guizhou",
      "云南省":           "Yunnan",
      "陕西省":           "Shaanxi",
      "甘肃省":           "Gansu",
      "青海省":           "Qinghai",
      "内蒙古自治区":     "Mongolie intérieure",
      "广西壮族自治区":   "Guangxi",
      "西藏自治区":       "Tibet",
      "宁夏回族自治区":   "Ningxia",
      "新疆维吾尔自治区": "Xinjiang",
      "香港特别行政区":   "Hong Kong",
      "澳门特别行政区":   "Macao",
      "台湾省":           "Taïwan"
    };

    const traductionPays = {
      "Russia":       "Russie",
      "Mongolia":     "Mongolie",
      "Kazakhstan":   "Kazakhstan",
      "Kyrgyzstan":   "Kirghizistan",
      "Tajikistan":   "Tadjikistan",
      "Afghanistan":  "Afghanistan",
      "Pakistan":     "Pakistan",
      "India":        "Inde",
      "Nepal":        "Népal",
      "Bhutan":       "Bhoutan",
      "Bangladesh":   "Bangladesh",
      "Myanmar":      "Myanmar",
      "Laos":         "Laos",
      "Vietnam":      "Viêt Nam",
      "Thailand":     "Thaïlande",
      "Cambodia":     "Cambodge",
      "Malaysia":     "Malaisie",
      "North Korea":  "Corée du Nord",
      "South Korea":  "Corée du Sud",
      "Japan":        "Japon",
      "Philippines":  "Philippines",
      "Iran":		  "Iran",
      "Brunei":		  "Brunei",
      "Uzbekistan":   "Ouzbékistan",
      "Turkmenistan": "Turkménistan",
      "Singapore":    "Singapour",
      "台湾省":        "Taïwan",
      "Indonesia":    "Indonésie"
    };

    let nomProvinces = [];
    let infoProvinces = {};
    let infoPays = {};
    let voisins = [];
    let chinaProvincesJson = null;
    let paysVisibles = true;


    Promise.all([
      fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson').then(r => r.json()),
      fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json').then(r => r.json()),
      fetch(`${BASE}/data/provinces.json`).then(r => r.json()),
      fetch(`${BASE}/data/pays.json`).then(r => r.json())
    ])
    .then(([worldJson, chinaData, provData, paysData]) => {
      chinaProvincesJson = chinaData;
      nomProvinces = chinaData.features.map(f => f.properties.name);
      infoProvinces = provData;
      infoPays = paysData;
      
      voisins = worldJson.features.filter(f =>
        paysAsie.includes(f.properties.name) && f.properties.name !== 'China'
      );

      const asieAvecProvinces = {
        type: 'FeatureCollection',
        features: [...voisins, ...chinaProvincesJson.features]
      };

      echarts.registerMap('asie-provinces', asieAvecProvinces);
      afficherCarte();
    });

    function afficherCarte() {
      carte.setOption({
        backgroundColor: '#1a1a2e',
        series: [{
          type: 'map',
          map: 'asie-provinces',
          roam: true,
          zoom: zoomActuel,
          center: paysVisibles ? CENTRE : [105, 35], 
          itemStyle: {
            areaColor: '#1e3a5f',
            borderColor: '#4a90a4',
            borderWidth: 0.5
          },
          emphasis: {
            itemStyle: { areaColor: '#000000' },
            label: {
              show: true,
              color: '#fff',
              fontSize: 11,
              formatter: params => traductionPays[params.name] || params.name
            }
          },
          select: {
            label: {
              show: true,
              color: '#fff',
              formatter: params => traductionPays[params.name] || traductionProvinces[params.name] || params.name
            }
          },
          data:[
            ...nomProvinces
            .filter(nom => nom !== '香港特别行政区' && nom !== '澳门特别行政区')
            .map(nom => ({
            name: nom,
            label: {
              formatter: traductionProvinces[nom] || nom,
              backgroundColor: 'rgba(0,0,0,0.5)',
              padding: [2, 4],
              borderRadius: 3
            },
            itemStyle: {
              areaColor: '#2a5298',
              borderColor: '#ffffff',
              borderWidth: 0.8
            },
            emphasis: {
              itemStyle: { areaColor: '#000000' },
              label: {
                show: true,
                color: '#fff',
                formatter: traductionProvinces[nom] || nom
              }
            }
          })),
            {
              name: '香港特别行政区',
              itemStyle: { areaColor: '#76349c', borderColor: '#ffffff', borderWidth: 1 },
              label: {
                show: true,
                formatter: 'HK',
                color: '#fff',
                fontSize: 9,
                fontWeight: 'bold',
                backgroundColor: '#76349c',
                padding: [2, 4],
                borderRadius: 3
                },
              emphasis: {
              itemStyle: { areaColor: '#000000' },
              label: { show: true, color: '#fff', formatter: 'Hong-Kong' }
              }
            },
            {
              name: '澳门特别行政区',
              itemStyle: { areaColor: '#76349c', borderColor: '#ffffff', borderWidth: 1 },
              label: {
                show: true,
                formatter: 'MC',
                color: '#fff',
                fontSize: 9,
                fontWeight: 'bold',
                backgroundColor: '#76349c',
                padding: [2, 4],
                borderRadius: 3
              },
              emphasis: {
              itemStyle: { areaColor: '#000000' },
              label: { show: true, color: '#fff', formatter: 'Macao' }
              }
            }
          ]
        }]
      }, true);
    }

    // ===================== GESTION DES CLICS =====================

    // Fonction utilitaire pour remonter une fiche en haut
    function scrollFicheTop(id) {
      const el = document.getElementById(id);
      if (el) el.scrollTop = 0;
    }

    // Remplir et afficher la fiche province
    function ouvrirProvince(province) {
      zoomActuel = province.zoom;
      carte.setOption({ series: [{ zoom: province.zoom, center: province.centre }] });

      document.getElementById('prov-photo').src = province.photo;
      document.getElementById('prov-photo-legende').innerHTML =
        '<a class="fiche-photo-lien" href="' + province.photoLien + '" target="_blank">' + province.photoLegende + '</a>';
      document.getElementById('prov-nom-chinois').textContent = province.nomChinois;
      document.getElementById('prov-nom-pinyin').textContent  = province.pinyin;
      document.getElementById('prov-capitale').textContent    = "Capitale : " + province.capitale;
      document.getElementById('prov-population').textContent  = province.population;
      document.getElementById('prov-superficie').textContent  = province.superficie;
      document.getElementById('prov-description').textContent = province.description;

      const conteneur = document.getElementById('prov-personnalites');
      conteneur.innerHTML = '';
      (province.personnalites || []).forEach(p => {
        const initiales = p.nom.split(' ').map(m => m[0]).join('').slice(0, 2).toUpperCase();
        conteneur.innerHTML += `
          <a class="personnalite" href="${p.lien}" target="_blank">
            <div class="perso-initiales">${initiales}</div>
            <div class="perso-info">
              <div class="perso-nom">${p.nom}</div>
              <div class="perso-desc">${p.desc}</div>
            </div>
            <div class="perso-fleche">→</div>
          </a>`;
      });

      document.getElementById('fiche-province').style.display = 'block';
      scrollFicheTop('fiche-province');
    }

    // Remplir et afficher la fiche pays
    function ouvrirPays(pays) {
      if (pays.centre) {
        zoomActuel = pays.zoom;
        carte.setOption({ series: [{ zoom: pays.zoom, center: pays.centre }] });
      }

      document.getElementById('pays-photo').src = pays.photo;
      document.getElementById('pays-photo-legende').innerHTML =
        '<a class="fiche-photo-lien" href="' + pays.photoLien + '" target="_blank">' + pays.photoLegende + '</a>';
      document.getElementById('pays-nom').textContent          = pays.nom;
      document.getElementById('pays-nom-fr').textContent       = pays.nomFr;
      document.getElementById('pays-frontiere').textContent    = pays.frontiere;
      document.getElementById('pays-commerce').textContent     = pays.commerce;
      document.getElementById('pays-universitaire').textContent = pays.universitaire;
      document.getElementById('pays-perception').textContent   = pays.perception;
      document.getElementById('pays-synthese').textContent     = pays.synthese;

      document.getElementById('pays-relations').innerHTML =
        `<span class="badge ${pays.relations.badge}">${pays.relations.texte}</span>`;
      document.getElementById('pays-militaire').innerHTML =
        `<span class="badge ${pays.militaire.badge}">${pays.militaire.texte}</span>`;

      document.getElementById('fiche-pays').style.display = 'block';
      scrollFicheTop('fiche-pays');
    }

    carte.on('click', params => {
      const nom = params.name;

      // Clic sur Taïwan → fiche de choix
      if (nom === '台湾省') {
        fermerFiches();
        document.getElementById('fiche-taiwan').style.display = 'block';
        scrollFicheTop('fiche-taiwan');
        return;
      }

      // Clic sur une province chinoise
      const province = infoProvinces[nom];
      if (province) {
        fermerFiches();
        ouvrirProvince(province);
        return;
      }

      // Clic sur un pays voisin
      const pays = infoPays[nom];
      if (pays) {
        fermerFiches();
        ouvrirPays(pays);
      }
    });

    function fermerFiches() {
      document.getElementById('fiche-province').style.display = 'none';
      document.getElementById('fiche-pays').style.display     = 'none';
      document.getElementById('fiche-taiwan').style.display   = 'none';
    }

    // Ferme uniquement la fiche Taiwan (retour à la carte sans fermer les autres)
    function fermerFicheTaiwan() {
      document.getElementById('fiche-taiwan').style.display = 'none';
    }

    function afficherTaiwanProvince() {
      document.getElementById('fiche-taiwan').style.display = 'none';
      const province = infoProvinces['台湾省'];
      if (!province) return;
      ouvrirProvince(province);
    }

    function afficherTaiwanPays() {
      document.getElementById('fiche-taiwan').style.display = 'none';
      const pays = infoPays['台湾省'];
      if (!pays) return;
      ouvrirPays(pays);
    }

    const couleursBadge = {
        'badge-vert':   '#2ecc71',
        'badge-orange':  '#f39c12',
        'badge-rouge':  '#e74c3c',
        'badge-gris':   '#7f8c8d'
      };

    function appliquerFiltre() {
      const filtre = document.getElementById('selectFiltre').value;
      afficherLegende(filtre);

      if (filtre === 'defaut') {
        afficherCarte();  // ← réinitialise complètement la carte
        return;
      }

      const dataPays = paysAsie
        .filter(p => p !== 'China')
        .map(nom => {
      const pays = infoPays[nom];
      const couleur = filtre === 'relations'
      ? couleursBadge[pays?.relations?.badge] || '#1e3a5f'
      : filtre === 'militaire'
        ? couleursBadge[pays?.militaire?.badge] || '#1e3a5f'
        : pays?.filtres?.[filtre]?.couleur || '#1e3a5f';
      return { 
        name: nom, 
        itemStyle: { areaColor: couleur },
          emphasis: {
            label: {
              show: true,
                color: '#fff',
                formatter: traductionPays[nom] || traductionProvinces[nom] || nom
            }
          },
        select: {
         label: {
          show: true,
          color: '#fff',
          formatter: params => traductionPays[params.name] || traductionProvinces[params.name] || params.name
          }
        }
       };
    });

      const dataProvinces = [
        ...nomProvinces
        .filter(nom => nom !== '香港特别行政区' && nom !== '澳门特别行政区')
        .map(nom => {
          const province = infoProvinces[nom];
          const couleur = province?.filtres?.[filtre]?.couleur || '#2a5298';
          return {
            name: nom,
            itemStyle: {
              areaColor: couleur,
              borderColor: '#ffffff',
              borderWidth: 0.8
            },
            emphasis: {
              itemStyle: { areaColor: '#000000' },
              label: {
                show: true,
                color: '#fff',
                formatter: traductionProvinces[nom] || nom
                }
              }
            };
          }),
        {
            name: '香港特别行政区',
            itemStyle: { areaColor: '#76349c', borderColor: '#ffffff', borderWidth: 1 },
            label: { show: true, formatter: 'HK', color: '#fff', fontSize: 9, fontWeight: 'bold', backgroundColor: '#76349c', padding: [2, 4], borderRadius: 3 },
            emphasis: {
              itemStyle: { areaColor: '#000000' },
              label: { show: true, color: '#fff', formatter: 'Hong-Kong' }
              }
            },
        {
            name: '澳门特别行政区',
            itemStyle: { areaColor: '#76349c', borderColor: '#ffffff', borderWidth: 1 },
            label: { show: true, formatter: 'MC', color: '#fff', fontSize: 9, fontWeight: 'bold', backgroundColor: '#76349c', padding: [2, 4], borderRadius: 3 },
            emphasis: {
              itemStyle: { areaColor: '#000000' },
              label: { show: true, color: '#fff', formatter: 'Macao' }
          }
        }
        ];

      carte.setOption({
      series: [{ data: [...dataPays, ...dataProvinces] }]
      });
    }

    const legendesFiltres = {
      "administrative": [
        { couleur: "#77c459", label: "Municipalité directe" },
        { couleur: "#fcff5c", label: "Région autonome" },
        { couleur: "#ff6868", label: "Province standard" },
        { couleur: "#76349c", label: "RAS" },
        { couleur: "#001dbe", label: "République de Chine" }
        ]
        //ajouter d'autres filtres ici plus tard
      };

      function afficherLegende(filtre) {
        const legende = document.getElementById('legende');
        const contenu = document.getElementById('legende-contenu');
        const items = legendesFiltres[filtre];

        if (!items) {
          legende.style.display = 'none';
          return;
        }

        contenu.innerHTML = items.map(item => `
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px; color:white;">
            <span style="background:${item.couleur}; width:16px; height:16px; border-radius:3px; display:inline-block; flex-shrink:0;"></span>
            ${item.label}
          </div>
        `).join('');

        legende.style.display = 'block';
      }

function togglePays() {
  paysVisibles = !paysVisibles;
  fermerFiches();  

  if (paysVisibles) {
    zoomActuel = ZOOM_INITIAL;
  } else {
    zoomActuel = 1.5;  // à ajuster selon ce qui te convient
  }

  const btn = document.getElementById('btn-pays');
  btn.textContent = paysVisibles ? '🌍 Masquer les pays' : '🌍 Afficher les pays';

  const features = paysVisibles
    ? [...voisins, ...chinaProvincesJson.features]
    : [...chinaProvincesJson.features];

  echarts.registerMap('asie-provinces', { type: 'FeatureCollection', features });
  afficherCarte();
}

    // ===================== ZOOM & NAVIGATION =====================
    function zoomer() {
      zoomActuel = Math.min(zoomActuel * 1.4, 20);
      carte.setOption({ series: [{ zoom: zoomActuel }] });
    }

    function dezoomer() {
      zoomActuel = Math.max(zoomActuel / 1.4, 0.5);
      carte.setOption({ series: [{ zoom: zoomActuel }] });
    }

    function resetZoom() {
      zoomActuel = ZOOM_INITIAL;
      fermerFiches();
      carte.setOption({ series: [{ zoom: zoomActuel, center: CENTRE }] });
    }

    // Synchronise le zoom ET limite le déplacement
    carte.on('georoam', () => {
      const option = carte.getOption();
      if (!option.series || !option.series[0]) return;

      zoomActuel = option.series[0].zoom || zoomActuel;

      // Récupère le centre actuel et le corrige si hors limites
      let [lon, lat] = option.series[0].center || CENTRE;
      let corrige = false;

      if (lon < LIMITES.lonMin) { lon = LIMITES.lonMin; corrige = true; }
      if (lon > LIMITES.lonMax) { lon = LIMITES.lonMax; corrige = true; }
      if (lat < LIMITES.latMin) { lat = LIMITES.latMin; corrige = true; }
      if (lat > LIMITES.latMax) { lat = LIMITES.latMax; corrige = true; }

      if (corrige) {
        carte.setOption({ series: [{ center: [lon, lat] }] });
      }
    });
