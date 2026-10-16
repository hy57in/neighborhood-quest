import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { Button } from '@comwit/ui';
import { Lang, NeighborhoodData, SensoryPriorityId } from '../types/index.ts';
import {
  LIQUIDITY_PILLAR_META,
  SENSORY_PRIORITY_OPTIONS,
  buildLiquidityMetrics,
  buildSensoryMetrics,
  createDetailedSceneDataUrl,
} from '../data/neighborhoods.ts';

interface ExploreViewProps {
  neighborhoods: NeighborhoodData[];
  selectedId: string;
  compareIds: string[];
  selectedSensoryPriorities: SensoryPriorityId[];
  onToggleSensoryPriority: (id: SensoryPriorityId) => void;
  onSelectNeighborhood: (id: string) => void;
  onConfirmLocationAndRecord: (neighborhoodId: string) => void;
  onAddNewPlaceNeighborhood: (newPlace: NeighborhoodData, goToRecord?: boolean) => void;
  onToggleCompare: (id: string) => void;
  lang?: Lang;
}

interface PlaceCandidate {
  name: string;
  subName: string;
  stationDistance: string;
  lat: number;
  lng: number;
  brandScore: number;
  brandLabel: string;
  newBuildScore: number;
  newBuildLabel: string;
  subwayScore: number;
  subwayLabel: string;
  schoolScore: number;
  schoolLabel: string;
  flatnessScore: number;
  flatnessLabel: string;
  householdsScore: number;
  householdsLabel: string;
  slopeDeg: number;
  hasWater?: boolean;
}

const KOREA_PLACE_PRESETS: PlaceCandidate[] = [
  {
    name: '반포 래미안원베일리 & 한강공원',
    subName: '2,990세대 하이엔드 신축 · 3·7·9호선 고속터미널역 · 평지 한강변',
    stationDistance: '고속터미널역·신반포역 도보 4분',
    lat: 37.5065,
    lng: 126.9985,
    brandScore: 100,
    brandLabel: '삼성물산 래미안 하이엔드',
    newBuildScore: 100,
    newBuildLabel: '2023년식 최신축 커튼월룩',
    subwayScore: 98,
    subwayLabel: '3·7·9호선 트리플 역세권',
    schoolScore: 98,
    schoolLabel: '잠원초·신반포중·세화고 명문학군',
    flatnessScore: 98,
    flatnessLabel: '경사 1° 완전 평지',
    householdsScore: 98,
    householdsLabel: '2,990세대 초대형 대단지',
    slopeDeg: 1,
    hasWater: true,
  },
  {
    name: '흑석 아크로리버하임 & 한강조망',
    subName: '1,073세대 1군 하이엔드 · 9호선 흑석역 초역세권',
    stationDistance: '흑석역(9호선 급행) 도보 3분',
    lat: 37.5088,
    lng: 126.9618,
    brandScore: 96,
    brandLabel: 'DL이앤씨 아크로(ACRO)',
    newBuildScore: 90,
    newBuildLabel: '2019년식 신축급',
    subwayScore: 97,
    subwayLabel: '9호선 흑석역 도보 3분 평지진입',
    schoolScore: 86,
    schoolLabel: '흑석초·중앙대부속중 인접',
    flatnessScore: 85,
    flatnessLabel: '정문 역세권 평지 + 후문 완경사',
    householdsScore: 86,
    householdsLabel: '1,073세대 대단지',
    slopeDeg: 5,
    hasWater: true,
  },
  {
    name: '강동 고덕 그라시움 & 명일근린공원',
    subName: '4,932세대 매머드급 신축 · 5호선 상일동역 초역세권 · 평지',
    stationDistance: '상일동역(5호선)·고덕역 도보 2분',
    lat: 37.5558,
    lng: 127.1665,
    brandScore: 95,
    brandLabel: '대우·현대·SK 1군 컨소시엄',
    newBuildScore: 93,
    newBuildLabel: '2019년식 신축 대단지',
    subwayScore: 96,
    subwayLabel: '5호선 상일동역 단지 직결급',
    schoolScore: 94,
    schoolLabel: '강덕초·고덕중·한영외고 학군',
    flatnessScore: 97,
    flatnessLabel: '경사 2° 완전 평지',
    householdsScore: 100,
    householdsLabel: '4,932세대 매머드급 대단지',
    slopeDeg: 2,
    hasWater: false,
  },
  {
    name: '광교 중흥S클래스 & 광교호수공원',
    subName: '2,231세대 신축 호수뷰 · 신분당선 광교중앙역 · 평지 공원직결',
    stationDistance: '광교중앙역(신분당선) 도보 6분',
    lat: 37.2838,
    lng: 127.0642,
    brandScore: 90,
    brandLabel: '광교 대장 주상복합 랜드마크',
    newBuildScore: 95,
    newBuildLabel: '2019년식 신축 커튼월 타워',
    subwayScore: 92,
    subwayLabel: '신분당선 광교중앙역 (강남 30분)',
    schoolScore: 93,
    schoolLabel: '광교호수초·광교호수중 초품아',
    flatnessScore: 96,
    flatnessLabel: '경사 2° 호수공원 평지 산책로',
    householdsScore: 94,
    householdsLabel: '2,231세대 대단지',
    slopeDeg: 2,
    hasWater: true,
  },
];

export const ExploreView: React.FC<ExploreViewProps> = ({
  neighborhoods,
  selectedId,
  compareIds,
  selectedSensoryPriorities,
  onToggleSensoryPriority,
  onSelectNeighborhood,
  onConfirmLocationAndRecord,
  onAddNewPlaceNeighborhood,
  onToggleCompare,
  lang = 'ko',
}) => {
  const selectedNeighborhood =
    neighborhoods.find((n) => n.id === selectedId) || neighborhoods[0];

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isSearchingPlace, setIsSearchingPlace] = useState<boolean>(false);
  const [placeSearchInput, setPlaceSearchInput] = useState<string>('');
  const [isFetchingGps, setIsFetchingGps] = useState<boolean>(false);
  const [isSearchingOsm, setIsSearchingOsm] = useState<boolean>(false);
  const [osmResults, setOsmResults] = useState<
    Array<{ displayName: string; shortName: string; lat: number; lng: number }>
  >([]);
  const [locationVerifiedBanner, setLocationVerifiedBanner] = useState<string | null>(null);
  const [pendingCandidate, setPendingCandidate] = useState<PlaceCandidate | null>(null);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const placeInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize interactive Leaflet map
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container || mapInstanceRef.current) return;

    const initialCoords = selectedNeighborhood?.coordinates || { lat: 37.5446, lng: 127.0443 };
    const map = L.map(container, {
      center: [initialCoords.lat, initialCoords.lng],
      zoom: 12,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 19,
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    markersLayerRef.current = markersLayer;

    // Allow clicking anywhere on the map to check/verify that coordinate
    map.on('click', async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=${lang}`
        );
        const data = await res.json();
        const roadOrSuburb =
          data?.address?.suburb ||
          data?.address?.quarter ||
          data?.address?.neighbourhood ||
          data?.address?.road ||
          data?.display_name?.split(',')?.[0] ||
          (lang === 'ko' ? '지도 선택 위치' : 'Selected Map Pin');
        const cityOrBorough =
          data?.address?.borough || data?.address?.city || (lang === 'ko' ? '서울' : 'Seoul');

        setPendingCandidate({
          name: `${cityOrBorough} ${roadOrSuburb}`,
          subName:
            lang === 'ko'
              ? `지도에서 직접 선택한 위치 (${lat.toFixed(4)}, ${lng.toFixed(4)})`
              : `Pinned on Map (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
          stationDistance: lang === 'ko' ? '인근 지하철역 도보권' : 'Near Subway Station',
          lat,
          lng,
          brandScore: 86,
          brandLabel: '1군 브랜드 단지권',
          newBuildScore: 84,
          newBuildLabel: '준신축/정비 주거지',
          subwayScore: 88,
          subwayLabel: '역세권 도보 7분',
          schoolScore: 86,
          schoolLabel: '인근 초·중 학군',
          flatnessScore: 82,
          flatnessLabel: '완경사/평지 혼재',
          householdsScore: 88,
          householdsLabel: '1,500세대급 주거지',
          slopeDeg: 6,
        });
        setLocationVerifiedBanner(null);
      } catch {
        // Ignore network errors on reverse geocode
      }
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
    };
  }, []);

  // Render markers for all neighborhoods + pending candidate
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    neighborhoods.forEach((n) => {
      const coords = n.coordinates || { lat: 37.5446, lng: 127.0443 };
      const isSelected = n.id === selectedId && !pendingCandidate;
      const grade = n.liquidity?.grade || 'A';

      const iconHtml = `
        <div style="
          display:flex;align-items:center;gap:4px;
          padding:4px 9px;border-radius:999px;
          background:${isSelected ? '#0051ff' : '#ffffff'};
          color:${isSelected ? '#ffffff' : '#191f28'};
          border:2px solid ${isSelected ? '#ffffff' : '#0051ff'};
          box-shadow:0 4px 12px rgba(0,0,0,0.18);
          font-size:11px;font-weight:800;white-space:nowrap;
          transform:${isSelected ? 'scale(1.08)' : 'scale(1)'};
        ">
          <span style="background:${isSelected ? '#ffffff' : '#e8f3ff'};color:#0051ff;padding:1px 5px;border-radius:99px;font-size:10px;">${grade}</span>
          <span>${n.name.split(' ').slice(0, 2).join(' ')}</span>
        </div>
      `;

      const marker = L.marker([coords.lat, coords.lng], {
        icon: L.divIcon({
          className: 'custom-nq-marker',
          html: iconHtml,
          iconSize: [120, 30],
          iconAnchor: [60, 15],
        }),
      });

      marker.on('click', () => {
        setPendingCandidate(null);
        setLocationVerifiedBanner(null);
        onSelectNeighborhood(n.id);
      });

      marker.addTo(markersLayer);
    });

    if (pendingCandidate) {
      const pendingHtml = `
        <div style="
          display:flex;align-items:center;gap:4px;
          padding:5px 10px;border-radius:999px;
          background:#e11d48;color:#ffffff;
          border:2px solid #ffffff;
          box-shadow:0 6px 16px rgba(225,29,72,0.35);
          font-size:11px;font-weight:800;white-space:nowrap;
        ">
          <span>📍 확인 중: ${pendingCandidate.name.slice(0, 12)}</span>
        </div>
      `;
      L.marker([pendingCandidate.lat, pendingCandidate.lng], {
        icon: L.divIcon({
          className: 'custom-pending-marker',
          html: pendingHtml,
          iconSize: [150, 32],
          iconAnchor: [75, 16],
        }),
      }).addTo(markersLayer);

      map.flyTo([pendingCandidate.lat, pendingCandidate.lng], 14, { duration: 0.7 });
    } else if (selectedNeighborhood?.coordinates) {
      map.flyTo(
        [selectedNeighborhood.coordinates.lat, selectedNeighborhood.coordinates.lng],
        13,
        { duration: 0.7 }
      );
    }
  }, [neighborhoods, selectedId, pendingCandidate]);

  // Fetch user's current GPS coordinates & reverse geocode to ask "여기가 맞나요?"
  const handleDetectCurrentGps = () => {
    if (!navigator.geolocation) {
      setIsSearchingPlace(true);
      return;
    }
    setIsFetchingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=${lang}`
          );
          const data = await res.json();
          const dongName =
            data?.address?.suburb ||
            data?.address?.quarter ||
            data?.address?.neighbourhood ||
            data?.address?.town ||
            (lang === 'ko' ? '내 현재 위치' : 'My Current Location');
          const guName = data?.address?.borough || data?.address?.city || '서울';

          setPendingCandidate({
            name: `${guName} ${dongName}`,
            subName:
              lang === 'ko'
                ? `GPS 현재 위치 감지됨 (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
                : `GPS Location Detected (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
            stationDistance: lang === 'ko' ? '인근 역세권 도보 6분' : '6 min walk to Station',
            lat: latitude,
            lng: longitude,
            brandScore: 88,
            brandLabel: '1군 브랜드 단지권',
            newBuildScore: 85,
            newBuildLabel: '준신축 아파트권',
            subwayScore: 90,
            subwayLabel: '역세권 도보 6분',
            schoolScore: 88,
            schoolLabel: '도보 통학 초·중 학군',
            flatnessScore: 86,
            flatnessLabel: '보행 양호 지형',
            householdsScore: 90,
            householdsLabel: '1,800세대급 주거지',
            slopeDeg: 5,
          });
          setLocationVerifiedBanner(null);
        } catch {
          setPendingCandidate({
            name: lang === 'ko' ? 'GPS 현재 위치 동네' : 'Current GPS Neighborhood',
            subName: `GPS (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
            stationDistance: lang === 'ko' ? '인근 지하철역 도보권' : 'Near Subway Station',
            lat: latitude,
            lng: longitude,
            brandScore: 88,
            brandLabel: '1군 브랜드 단지',
            newBuildScore: 85,
            newBuildLabel: '준신축 단지',
            subwayScore: 90,
            subwayLabel: '역세권 도보권',
            schoolScore: 88,
            schoolLabel: '초·중 도보 학군',
            flatnessScore: 86,
            flatnessLabel: '평지/완경사',
            householdsScore: 90,
            householdsLabel: '대단지 주거권',
            slopeDeg: 5,
          });
        } finally {
          setIsFetchingGps(false);
        }
      },
      () => {
        setIsFetchingGps(false);
        setIsSearchingPlace(true);
        setTimeout(() => placeInputRef.current?.focus(), 80);
      },
      { timeout: 6000 }
    );
  };

  // Search places via OpenStreetMap Nominatim API
  const handleOsmPlaceSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = placeSearchInput.trim();
    if (!q) return;
    setIsSearchingOsm(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&countrycodes=kr&limit=5&accept-language=${lang}&q=${encodeURIComponent(q)}`
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        setOsmResults(
          data.map((item: any) => ({
            displayName: item.display_name,
            shortName: item.name || item.display_name.split(',')[0] || q,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
          }))
        );
      }
    } catch {
      setOsmResults([]);
    } finally {
      setIsSearchingOsm(false);
    }
  };

  const materializeCandidateIntoNeighborhood = (candidate: PlaceCandidate): NeighborhoodData => {
    const id = `custom-${Date.now()}`;
    const inclinePercent = Math.min(95, Math.max(5, Math.round(candidate.slopeDeg * 4.6)));
    const sceneUrl = createDetailedSceneDataUrl({
      skyTop: '#bae6fd',
      skyBottom: '#fde68a',
      sunColor: '#f59e0b',
      hillColor: '#10b981',
      roadColor: '#475569',
      bldg1Color: '#f8fafc',
      bldg2Color: '#e2e8f0',
      cafeColor: '#d97757',
      treeColor: '#059669',
      waterColor: candidate.hasWater ? '#38bdf8' : undefined,
      slopeDeg: candidate.slopeDeg,
      label: candidate.name,
    });

    return {
      id,
      name: candidate.name,
      nameEn: candidate.name,
      subName: candidate.subName,
      subNameEn: candidate.subName,
      stationDistance: candidate.stationDistance,
      stationDistanceEn: candidate.stationDistance,
      timeContext: '골든아워',
      timeContextEn: 'Golden Hour',
      quote: `“직접 위치 확인 후 선택한 ${candidate.name}입니다. 사진을 첨부하거나 메모를 남겨 Gemini 4 Argon 3D 단지로 복원해보세요!”`,
      quoteEn: `“Verified location: ${candidate.name}. Attach photos or notes to reconstruct in 3D with Gemini 4 Argon!”`,
      quoteAuthor: '핑구',
      dioramaImageUrl: sceneUrl,
      inclineAngleDeg: candidate.slopeDeg,
      inclinePercent,
      cozinessPercent: 92,
      noiseDb: 32,
      greenWalkMinutes: 3,
      tags: ['#위치인증완료', '#환금성6대입지', '#직접탐색단지'],
      tagsEn: ['#VerifiedLocation', '#6LiquidityPillars', '#CustomPlace'],
      coordinates: { lat: candidate.lat, lng: candidate.lng },
      perspective: 'pingu',
      sensoryPriorities: selectedSensoryPriorities,
      liquidity: buildLiquidityMetrics({
        brandScore: candidate.brandScore,
        brandLabel: candidate.brandLabel,
        brandDetail: '1군 브랜드 선호도 반영',
        newBuildScore: candidate.newBuildScore,
        newBuildLabel: candidate.newBuildLabel,
        newBuildDetail: '연식 및 커뮤니티 상품성',
        subwayScore: candidate.subwayScore,
        subwayLabel: candidate.subwayLabel,
        subwayDetail: '지하철역 도보 접근성',
        schoolScore: candidate.schoolScore,
        schoolLabel: candidate.schoolLabel,
        schoolDetail: '초등학교 및 학원가 접근성',
        flatnessScore: candidate.flatnessScore,
        flatnessLabel: candidate.flatnessLabel,
        flatnessDetail: '체감 경사도 및 평지 비율',
        householdsScore: candidate.householdsScore,
        householdsLabel: candidate.householdsLabel,
        householdsDetail: '세대수 규모 및 거래 환금성',
      }),
      memoryLayers: {
        physical: [candidate.subName, candidate.stationDistance, `경사각 ${candidate.slopeDeg}°`],
        sensory: ['선택한 감각기억 우선순위 반영', '주변 공원 및 보행 환경'],
        emotional: ['내가 직접 검색·확인한 관심 단지'],
      },
      metrics: buildSensoryMetrics(inclinePercent, 92, 32, 3),
      audioMemo: {
        id: `memo-${id}`,
        title: `음성 메모 · ${candidate.name}`,
        durationSeconds: 15,
        durationStr: '0:15',
        quote: `“${candidate.name} 현장에 도착해서 주변 단지 규모와 평지/경사도를 확인했어요.”`,
        recordedAt: '방금 녹음',
      },
      photos: [
        {
          id: `photo-${id}`,
          url: sceneUrl,
          alt: candidate.name,
          caption: `${candidate.name} 현장 이미지`,
          timeTaken: '방금 촬영',
        },
      ],
    };
  };

  const handleConfirmLocation = (goToRecord: boolean) => {
    if (pendingCandidate) {
      const created = materializeCandidateIntoNeighborhood(pendingCandidate);
      setPendingCandidate(null);
      setIsSearchingPlace(false);
      setLocationVerifiedBanner(
        lang === 'ko'
          ? `✅ 「${created.name}」 위치가 확인되어 탐색 목록에 등록되었습니다!`
          : `✅ Verified "${created.name}" and added to your neighborhood list!`
      );
      onAddNewPlaceNeighborhood(created, goToRecord);
      return;
    }

    setLocationVerifiedBanner(
      lang === 'ko'
        ? `✅ 「${selectedNeighborhood.name}」 위치가 확인되었습니다!`
        : `✅ Verified location: "${selectedNeighborhood.name}"!`
    );
    if (goToRecord) {
      onConfirmLocationAndRecord(selectedNeighborhood.id);
    } else {
      onSelectNeighborhood(selectedNeighborhood.id);
    }
  };

  const categories = [
    { id: 'all', label: lang === 'ko' ? '전체 (5+)' : 'All Areas' },
    { id: 'gradeS', label: lang === 'ko' ? '💎 환금성 S등급' : '💎 Liquidity Grade S' },
    { id: 'flat', label: lang === 'ko' ? '👟 5. 평지 우수' : '👟 Flat Terrain' },
    { id: 'subway', label: lang === 'ko' ? '🚇 3. 초역세권' : '🚇 Subway <5m' },
    { id: 'mega', label: lang === 'ko' ? '🏘️ 6. 대단지(3천세대+)' : '🏘️ 3,000+ Households' },
  ];

  const filtered = neighborhoods.filter((n) => {
    const matchesQuery =
      n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.subName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.stationDistance.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesQuery) return false;
    if (activeCategory === 'all') return true;
    if (activeCategory === 'gradeS') return (n.liquidity?.totalScore ?? 0) >= 88;
    if (activeCategory === 'flat') return (n.liquidity?.flatness.score ?? 0) >= 90;
    if (activeCategory === 'subway') return (n.liquidity?.subway.score ?? 0) >= 94;
    if (activeCategory === 'mega') return (n.liquidity?.households.score ?? 0) >= 95;
    return true;
  });

  const displayTargetName = pendingCandidate
    ? pendingCandidate.name
    : lang === 'en' && selectedNeighborhood?.nameEn
      ? selectedNeighborhood.nameEn
      : selectedNeighborhood?.name;

  const displayTargetSub = pendingCandidate
    ? pendingCandidate.subName
    : selectedNeighborhood?.stationDistance;

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Interactive Leaflet Map + Location Verification Card */}
      <section className="bg-white rounded-3xl border border-[#edf0f3] shadow-[0_4px_20px_rgba(0,0,0,0.04)] overflow-hidden">
        {/* Top Map Header */}
        <div className="px-4 py-3 border-b border-[#edf0f3] flex items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#0051ff] animate-pulse" />
              <span className="text-[11px] font-extrabold text-[#0051ff] uppercase tracking-wider">
                {lang === 'ko' ? 'STEP 1 · 지도 탐색 & 위치 확인' : 'STEP 1 · MAP EXPLORE & VERIFY'}
              </span>
            </div>
            <h2 className="text-[15px] font-extrabold text-[#191f28] mt-0.5">
              {lang === 'ko'
                ? '지도에서 동네를 고르거나 현재 위치를 확인하세요'
                : 'Pick a neighborhood on the map or verify your location'}
            </h2>
          </div>

          <Button
            variant="outline"
            size="xs"
            onClick={handleDetectCurrentGps}
            disabled={isFetchingGps}
            className="!rounded-xl !text-[11px] !font-bold !border-[#0051ff]/30 !text-[#0051ff] hover:!bg-[#e8f3ff] shrink-0"
          >
            <span className="material-symbols-outlined text-[15px]">my_location</span>
            <span>
              {isFetchingGps
                ? lang === 'ko'
                  ? '위치 확인 중...'
                  : 'Locating...'
                : lang === 'ko'
                  ? '내 현재위치 가져오기'
                  : 'Use My GPS'}
            </span>
          </Button>
        </div>

        {/* Leaflet Map Container */}
        <div className="relative w-full h-[230px] bg-slate-100">
          <div ref={mapContainerRef} className="w-full h-full z-0" />
          <div className="pointer-events-none absolute bottom-2 left-2 z-[400] bg-slate-900/80 backdrop-blur-xs text-white px-2.5 py-1 rounded-lg text-[10px] font-semibold">
            {lang === 'ko'
              ? '💡 지도의 핀을 누르거나 원하는 위치를 직접 터치해보세요'
              : '💡 Tap any pin or click anywhere on the map'}
          </div>
        </div>

        {/* Location Confirmation Box ("여기가 맞는지 확인. 아니라면 장소 검색해서 입력") */}
        <div className="p-4 bg-[#f8faff] border-t border-[#e5eefb] flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-2xl bg-[#0051ff] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <span className="material-symbols-outlined text-[20px]">where_to_vote</span>
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-[#0051ff] block">
                  {lang === 'ko'
                    ? '📍 가져온 위치정보 확인 — 여기가 맞나요?'
                    : '📍 Verify Location — Is this the right place?'}
                </span>
                <p className="text-[15px] font-extrabold text-[#191f28] truncate mt-0.5">
                  {displayTargetName}
                </p>
                <p className="text-[11px] text-[#4e5968] truncate">{displayTargetSub}</p>
              </div>
            </div>

            {selectedNeighborhood?.liquidity && !pendingCandidate && (
              <span className="px-2.5 py-1 rounded-full bg-[#0051ff] text-white text-[11px] font-extrabold shrink-0">
                {lang === 'ko'
                  ? `환금성 ${selectedNeighborhood.liquidity.grade} (${selectedNeighborhood.liquidity.totalScore}점)`
                  : `Grade ${selectedNeighborhood.liquidity.grade} (${selectedNeighborhood.liquidity.totalScore})`}
              </span>
            )}
          </div>

          {locationVerifiedBanner && (
            <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[12px] font-bold flex items-center justify-between">
              <span>{locationVerifiedBanner}</span>
            </div>
          )}

          {/* Yes / No (Search Another Place) Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleConfirmLocation(true)}
              className="py-2.5 px-3 rounded-xl bg-[#0051ff] hover:bg-[#0041cc] text-white text-[12px] font-extrabold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>
                {lang === 'ko' ? '네, 여기가 맞아요 (기록/3D)' : 'Yes, Confirm & Record'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsSearchingPlace((prev) => !prev);
                setTimeout(() => placeInputRef.current?.focus(), 80);
              }}
              className={`py-2.5 px-3 rounded-xl text-[12px] font-extrabold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                isSearchingPlace
                  ? 'bg-[#191f28] text-white border-[#191f28]'
                  : 'bg-white hover:bg-[#f2f4f6] text-[#191f28] border-[#d1d6db]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">search</span>
              <span>
                {lang === 'ko' ? '아니요, 장소 검색해서 입력' : 'No, Search Another Place'}
              </span>
            </button>
          </div>

          {/* Expandable Place Search Panel when user clicks "아니요, 장소 검색해서 입력" */}
          {isSearchingPlace && (
            <div className="mt-1 p-3.5 rounded-2xl bg-white border border-[#d1e0ff] shadow-sm flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-extrabold text-[#191f28]">
                  {lang === 'ko'
                    ? '🔍 다른 아파트 단지·동네·지하철역 검색해서 입력'
                    : '🔍 Search & Enter Any Apartment, Dong, or Subway Station'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsSearchingPlace(false)}
                  className="text-[11px] font-bold text-[#8b95a1] hover:text-[#191f28]"
                >
                  {lang === 'ko' ? '닫기 ✕' : 'Close ✕'}
                </button>
              </div>

              <form onSubmit={handleOsmPlaceSearch} className="flex items-center gap-1.5">
                <input
                  ref={placeInputRef}
                  type="text"
                  value={placeSearchInput}
                  onChange={(e) => setPlaceSearchInput(e.target.value)}
                  placeholder={
                    lang === 'ko'
                      ? '예: 반포 원베일리, 흑석동, 고덕 그라시움, 광교호수공원...'
                      : 'e.g., Banpo, Heukseok, Godeok, Gwanggyo...'
                  }
                  className="flex-1 px-3 py-2 rounded-xl bg-[#f7f9fb] border border-[#e5e8eb] text-[13px] text-[#191f28] focus:outline-none focus:border-[#0051ff]"
                />
                <button
                  type="submit"
                  disabled={isSearchingOsm}
                  className="px-3.5 py-2 rounded-xl bg-[#0051ff] text-white text-[12px] font-bold hover:bg-[#0041cc] shrink-0 cursor-pointer"
                >
                  {isSearchingOsm
                    ? lang === 'ko'
                      ? '검색중...'
                      : 'Searching...'
                    : lang === 'ko'
                      ? '장소 검색'
                      : 'Search'}
                </button>
              </form>

              {/* Live OpenStreetMap Search Results */}
              {osmResults.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-[#0051ff]">
                    {lang === 'ko' ? '지도 검색 결과 (클릭하면 위치로 지정됩니다):' : 'Map Search Results:'}
                  </span>
                  {osmResults.map((r, idx) => (
                    <button
                      key={`${r.lat}-${r.lng}-${idx}`}
                      type="button"
                      onClick={() => {
                        setPendingCandidate({
                          name: r.shortName,
                          subName: r.displayName.split(',').slice(0, 3).join(' · '),
                          stationDistance: lang === 'ko' ? '인근 지하철역 도보권' : 'Near Subway Station',
                          lat: r.lat,
                          lng: r.lng,
                          brandScore: 88,
                          brandLabel: '1군 브랜드 단지권',
                          newBuildScore: 86,
                          newBuildLabel: '신축/준신축 주거지',
                          subwayScore: 90,
                          subwayLabel: '역세권 도보권',
                          schoolScore: 88,
                          schoolLabel: '초·중·고 학군 인접',
                          flatnessScore: 85,
                          flatnessLabel: '보행 양호 지형',
                          householdsScore: 90,
                          householdsLabel: '대단지 주거 구역',
                          slopeDeg: 4,
                        });
                        setOsmResults([]);
                      }}
                      className="text-left p-2.5 rounded-xl bg-[#f8faff] hover:bg-[#e8f3ff] border border-[#e5eefb] transition-colors flex items-center justify-between gap-2 cursor-pointer"
                    >
                      <div className="min-w-0">
                        <p className="text-[12px] font-extrabold text-[#191f28] truncate">
                          📍 {r.shortName}
                        </p>
                        <p className="text-[10px] text-[#4e5968] truncate">{r.displayName}</p>
                      </div>
                      <span className="text-[11px] font-bold text-[#0051ff] shrink-0">
                        {lang === 'ko' ? '이 위치 선택' : 'Select'}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Instant Popular Real-Estate Complex Presets */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-[#8b95a1]">
                  {lang === 'ko'
                    ? '⚡ 인기 임장 대단지 바로 선택 (환금성 6대 지표 자동 로드):'
                    : '⚡ Quick Popular Complexes:'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {KOREA_PLACE_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setPendingCandidate(preset);
                      }}
                      className="text-left p-2 rounded-xl bg-[#f7f9fb] hover:bg-[#e8f3ff] border border-[#edf0f3] transition-colors cursor-pointer"
                    >
                      <p className="text-[12px] font-bold text-[#191f28] truncate">
                        🏢 {preset.name}
                      </p>
                      <p className="text-[10px] text-[#8b95a1] truncate mt-0.5">
                        {preset.stationDistance}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2. User's Important Sensory Memory Priorities Selector ("감각기억은 내가 중요하게 생각하는 요소를 고르고") */}
      <section className="bg-white rounded-3xl p-4 border border-[#edf0f3] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold text-[#0051ff]">
              {lang === 'ko'
                ? '✨ 내가 중요하게 생각하는 감각기억 선택'
                : '✨ Pick Your Sensory Memory Priorities'}
            </span>
            <p className="text-[11px] text-[#8b95a1]">
              {lang === 'ko'
                ? '선택한 감각 요소와 나의 선호도가 동네 궁합 및 3D 디오라마에 반영됩니다.'
                : 'Selected sensory elements highlight matching neighborhoods and 3D scenes.'}
            </p>
          </div>
          <span className="text-[11px] font-bold text-[#0051ff] bg-[#e8f3ff] px-2 py-0.5 rounded-full">
            {lang === 'ko'
              ? `${selectedSensoryPriorities.length}개 선택중`
              : `${selectedSensoryPriorities.length} active`}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {SENSORY_PRIORITY_OPTIONS.map((opt) => {
            const active = selectedSensoryPriorities.includes(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onToggleSensoryPriority(opt.id)}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer border ${
                  active
                    ? 'bg-[#0051ff] text-white border-[#0051ff] shadow-xs'
                    : 'bg-[#f7f9fb] text-[#4e5968] border-[#edf0f3] hover:bg-[#edf0f3]'
                }`}
              >
                <span>{opt.icon}</span>
                <span>{lang === 'ko' ? opt.labelKo : opt.labelEn}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-3 border border-[#edf0f3] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center gap-2">
        <span className="material-symbols-outlined text-[#8b95a1] text-[20px]">search</span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={
            lang === 'ko'
              ? '목록 내 동네, 브랜드(래미안/엘스/파크힐스), 역세권 검색...'
              : 'Filter list by neighborhood, brand, or station...'
          }
          className="w-full text-[13px] text-[#191f28] placeholder-[#8b95a1] focus:outline-none bg-transparent"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="text-[#8b95a1] hover:text-[#191f28]"
          >
            <span className="material-symbols-outlined text-[18px]">cancel</span>
          </button>
        )}
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#111315] text-white shadow-xs'
                  : 'bg-white text-[#4e5968] border border-[#edf0f3] hover:bg-[#f2f4f6]'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* 4. Neighborhood Cards with Objective Liquidity 6 Pillars + Subjective Sensory Memory */}
      <div className="flex flex-col gap-3">
        {filtered.map((item) => {
          const isSelected = item.id === selectedId;
          const isInCompare = compareIds.includes(item.id);
          const liq = item.liquidity;
          const matchingPriorities = (item.sensoryPriorities || []).filter((p) =>
            selectedSensoryPriorities.includes(p)
          );

          return (
            <div
              key={item.id}
              className={`bg-white rounded-3xl p-4 border transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)] ${
                isSelected ? 'border-[#0051ff] ring-2 ring-[#0051ff]/20' : 'border-[#edf0f3]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => onSelectNeighborhood(item.id)}
                >
                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    {liq && (
                      <span className="px-2 py-0.5 rounded-md bg-[#0051ff] text-white text-[10px] font-extrabold">
                        {lang === 'ko'
                          ? `환금성 ${liq.grade}등급 (${liq.totalScore}점)`
                          : `Liquidity ${liq.grade} (${liq.totalScore}pts)`}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-md bg-[#e8f3ff] text-[#0051ff] text-[10px] font-bold">
                      {lang === 'ko'
                        ? `내가 고른 감각기억 ${matchingPriorities.length}개 일치`
                        : `${matchingPriorities.length} Sensory Matches`}
                    </span>
                    <span className="text-[11px] text-[#8b95a1]">{item.stationDistance}</span>
                  </div>
                  <h3 className="text-[16px] font-extrabold text-[#191f28]">
                    {lang === 'en' && item.nameEn ? item.nameEn : item.name}
                  </h3>
                  <p className="text-[12px] text-[#4e5968] mt-0.5">
                    {lang === 'en' && item.subNameEn ? item.subNameEn : item.subName}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleCompare(item.id)}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
                    isInCompare
                      ? 'bg-[#0051ff] text-white'
                      : 'bg-[#f2f4f6] text-[#4e5968] hover:bg-[#e5e8eb]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">balance</span>
                  <span>
                    {isInCompare
                      ? lang === 'ko'
                        ? '비교중'
                        : 'Comparing'
                      : lang === 'ko'
                        ? '비교 담기'
                        : 'Compare'}
                  </span>
                </button>
              </div>

              {/* Objective Location: 6 Liquidity Pillars Grid (1.브랜드 2.신축 3.역세권 4.학군 5.평지 6.세대수) */}
              {liq && (
                <div
                  onClick={() => onSelectNeighborhood(item.id)}
                  className="mt-3 pt-3 border-t border-[#f2f4f6] cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-extrabold text-[#4e5968]">
                      {lang === 'ko'
                        ? '📊 객관적 입지 (환금성 6대 기준)'
                        : '📊 Objective Location (6 Liquidity Pillars)'}
                    </span>
                    <span className="text-[10px] font-bold text-[#0051ff]">
                      {lang === 'ko' ? '클릭 시 3D 단지 복원 보기 →' : 'Click to open 3D World →'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                    {LIQUIDITY_PILLAR_META.map((pillar) => {
                      const metric = liq[pillar.key];
                      return (
                        <div
                          key={pillar.key}
                          className="bg-[#f7f9fb] rounded-xl p-2 border border-[#edf0f3] flex flex-col"
                        >
                          <span className="text-[10px] font-bold text-[#8b95a1] truncate">
                            {lang === 'ko' ? pillar.labelKo : pillar.labelEn}
                          </span>
                          <span className="text-[13px] font-extrabold text-[#191f28] mt-0.5">
                            {metric.score}
                            <span className="text-[10px] font-semibold text-[#8b95a1]">점</span>
                          </span>
                          <span className="text-[9px] text-[#4e5968] truncate mt-0.5">
                            {metric.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Selected Sensory Memory Badges & Action Buttons */}
              <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-[#f7f9fb]">
                <div className="flex flex-wrap gap-1">
                  {(item.sensoryPriorities || []).map((pId) => {
                    const meta = SENSORY_PRIORITY_OPTIONS.find((o) => o.id === pId);
                    if (!meta) return null;
                    const isUserPreferred = selectedSensoryPriorities.includes(pId);
                    return (
                      <span
                        key={pId}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          isUserPreferred
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-[#f7f9fb] text-[#4e5968]'
                        }`}
                      >
                        {meta.icon} {lang === 'ko' ? meta.labelKo : meta.labelEn}
                      </span>
                    );
                  })}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onConfirmLocationAndRecord(item.id)}
                    className="px-2.5 py-1.5 rounded-xl bg-[#f2f4f6] hover:bg-[#e5e8eb] text-[#191f28] text-[11px] font-bold cursor-pointer"
                  >
                    {lang === 'ko' ? '기록하기' : 'Record'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectNeighborhood(item.id)}
                    className="px-3 py-1.5 rounded-xl bg-[#0051ff] hover:bg-[#0041cc] text-white text-[11px] font-bold flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>{lang === 'ko' ? '3D 디오라마' : '3D Diorama'}</span>
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
