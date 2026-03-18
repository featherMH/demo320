const { createApp, ref, onMounted, computed } = Vue;

const app = createApp({
    setup() {
        const dbData = ref(null);
        const activeNav = ref('home');
        const searchQuery = ref('');
        const isMobileMenuOpen = ref(false);
        
        const sortKey = ref('name');
        const sortOrder = ref(1); 
        const activeMenuId = ref(null);

        onMounted(async () => {
            try {
                const res = await fetch('../assets/data.json'); 
                dbData.value = await res.json();
            } catch (err) { console.error("Loading failed", err); }
        });

        const handleSort = (key) => {
            if (sortKey.value === key) {
                sortOrder.value *= -1;
            } else {
                sortKey.value = key;
                sortOrder.value = 1;
            }
        };

        const getAvatars = (users) => {
            if (!users) return { list: [], extra: 0 };
            const limit = 4;
            return {
                list: users.slice(0, limit),
                extra: users.length > limit ? users.length - limit : 0
            };
        };

        const filteredFolders = computed(() => {
            if (!dbData.value) return [];
            return dbData.value.folders.filter(f => 
                f.name.toLowerCase().includes(searchQuery.value.toLowerCase())
            );
        });

        const filteredFiles = computed(() => {
            if (!dbData.value) return [];
            let files = dbData.value.recentFiles.filter(f => 
                f.name.toLowerCase().includes(searchQuery.value.toLowerCase())
            );

            return files.sort((a, b) => {
                let valA, valB;
                if (sortKey.value === 'sharedUsers') {
                    valA = a.sharedUsers?.length || 0;
                    valB = b.sharedUsers?.length || 0;
                } else if (sortKey.value === 'size') {
                    valA = parseFloat(a.size) || 0;
                    valB = parseFloat(b.size) || 0;
                } else {
                    valA = a[sortKey.value];
                    valB = b[sortKey.value];
                }
                if (valA < valB) return -1 * sortOrder.value;
                if (valA > valB) return 1 * sortOrder.value;
                return 0;
            });
        });

        const toggleMenu = (id) => {
            activeMenuId.value = activeMenuId.value === id ? null : id;
        };

        return { 
            dbData, activeNav, searchQuery, filteredFiles, filteredFolders,
            getAvatars, isMobileMenuOpen, handleSort, 
            sortKey, sortOrder, activeMenuId, toggleMenu 
        };
    },
    template: `
    <div v-if="dbData" class="flex h-[1024px] bg-[#F8FAFC] text-[#334155] font-sans overflow-hidden" @click="activeMenuId = null">
        
        <aside class="hidden lg:flex w-[262px] h-[1024px] bg-white border-r border-[#E2E8F0] flex-col shrink-0 relative z-40">
            <div class="p-[32px] mb-[16px] flex items-center gap-[12px]">
                <img src="assets/icons/Vector.svg" class="w-[33px]" alt="Logo">
                <img src="assets/icons/Vector2.svg" class="w-[103px]" alt="Dropbox">
            </div>

            <nav class="space-y-[4px] flex-1 px-[16px]">
                <div v-for="nav in dbData.navigation" :key="nav.id" @click="activeNav = nav.id" class="relative">
                    <div v-if="activeNav === nav.id" class="absolute -left-[16px] top-1/2 -translate-y-1/2">
                        <img src="assets/icons/logo-dropbox.svg" class="w-[11px] object-contain" alt="active">
                    </div>
                    <div :class="['flex items-center px-[16px] py-[12px] cursor-pointer rounded-[12px] transition-all duration-200',
                                activeNav === nav.id ? 'text-[#0061FF] font-semibold' : 'text-[#667085] hover:bg-gray-50']">
                        <img :src="nav.icon" class="w-[20px] h-[20px] mr-[16px]">
                        <span class="text-[20px]">{{ nav.label }}</span>
                    </div>
                </div>
            </nav>

            <div class="m-[32px] mt-auto bg-[#F8FAFC] p-[24px] rounded-[16px] border border-[#F1F5F9] relative overflow-hidden">
                <img src="assets/icons/Rectangle 28.svg" class="w-[97px] mb-[16px] opacity-50">
                <p class="text-[14px] font-bold text-[#1E293B] mb-[4px]">{{ dbData.storage.percentage }}% In-use</p>
                <div class="w-full bg-[#E2E8F0] h-[6px] rounded-full mb-[8px]">
                    <div class="bg-[#0061FF] h-full rounded-full" :style="{ width: dbData.storage.percentage + '%' }"></div>
                </div>
                <div class="flex justify-between text-[14px] text-[#667085] mb-[16px]">
                    <span class="text-[#1E293B]">{{ dbData.storage.used }}{{ dbData.storage.unit }}</span>
                    <span>{{ dbData.storage.total }}{{ dbData.storage.unit }}</span>
                </div>
                <button class="w-[141px] bg-[#0061FF] text-white py-[10px] rounded-[8px] text-[14px] font-semibold hover:bg-[#0052D9] transition">Upgrade</button>
            </div>
        </aside>

        <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
            <header class="lg:hidden h-[64px] bg-white border-b border-[#E2E8F0] px-[24px] flex justify-between items-center shrink-0">
                <div class="flex items-center gap-[8px]">
                    <img src="assets/icons/Vector.svg" class="h-[24px]">
                    <span class="font-bold text-[#1E293B]">Dropbox</span>
                </div>
                <button @click="isMobileMenuOpen = true" class="p-[8px] text-[#667085]">
                    <span class="text-[24px]">☰</span>
                </button>
            </header>

            <main class="flex-1 overflow-y-auto p-[24px] md:p-[32px] lg:p-[48px]">
                <header class="flex flex-col md:flex-row md:justify-between md:items-center mb-[40px] gap-[24px]">
                    <div>
                        <h1 class="text-[28px] lg:text-[30px] font-bold text-[#1E293B]">My Cloud</h1>
                        <p class="text-[20px] text-[#667085] mt-[4px]">Welcome, {{ dbData.user.name }}! 👋</p>
                    </div>
                    
                    <div class="flex items-center gap-[16px]">
                        <div class="relative flex-1 md:w-[320px]">
                            <input v-model="searchQuery" type="text" placeholder="Search anything here" 
                                class="w-full pl-[44px] pr-[16px] py-[12px] bg-white border border-[#E2E8F0] rounded-[12px] text-[14px] text-[#1E293B] outline-none focus:border-[#0061FF] placeholder:text-[#667085]">
                            <img src="assets/icons/icon-search.svg" class="absolute left-[14px] top-1/2 -translate-y-1/2 w-[17px] opacity-40">
                        </div>
                        <div class="flex items-center gap-[12px]">
                            <button class="w-[44px] h-[44px] bg-white border border-[#E2E8F0] rounded-[12px] flex items-center justify-center relative hover:bg-gray-50 transition">
                                <img src="assets/icons/icon-notification.svg" class="w-[20px] h-[20px]">
                            </button>
                            <button class="w-[44px] h-[44px] bg-white border border-[#E2E8F0] rounded-[12px] flex items-center justify-center hover:bg-gray-50 transition">
                                <img src="assets/icons/icon-settings.svg" class="w-[20px] h-[20px]">
                            </button>
                        </div>
                        <img :src="dbData.user.avatar" class="w-[44px] h-[44px] rounded-[12px] shrink-0 object-cover">
                    </div>
                </header>

                <section class="mb-[48px]">
                    <div class="flex justify-between items-center mb-[24px]">
                        <h2 class="text-[24px] font-medium text-[#1E293B]">All files</h2>
                        <button class="bg-[#0061FF]/10 text-[#0061FF] px-[28px] py-[10px] rounded-[10px] text-[14px] font-bold hover:bg-[#0061FF]/20 transition">+ Add new</button>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px] lg:gap-[32px]">
                        <div v-for="folder in filteredFolders" :key="folder.id" 
                            class="bg-white p-[24px] lg:p-[32px] rounded-[32px] border border-[#F1F5F9] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                            <div class="flex items-start justify-between">
                                <div class="flex items-center gap-[12px]">
                                    <img :src="folder.icon || 'assets/icons/icon-folder.svg'" class="w-[40px] h-[40px] shrink-0">
                                    <div class="min-w-0 font-medium">
                                        <h3 class="font-bold text-[16px] text-[#1E293B] leading-tight">{{ folder.name }}</h3>
                                        <p class="text-[14px] text-[#667085] mt-[4px]">{{ folder.modifiedDate }}</p>
                                    </div>
                                </div>
                                <div class="relative">
                                    <button @click.stop="toggleMenu('folder-'+folder.id)" class="text-[#667085] p-[4px] hover:bg-gray-50 rounded-full transition shrink-0">
                                        <img src="assets/icons/icon-more.svg" class="w-[4px] opacity-60">
                                    </button>
                                    <div v-if="activeMenuId === 'folder-'+folder.id" class="absolute right-0 top-full mt-2 w-32 bg-white border border-gray-100 shadow-xl rounded-lg z-50 py-1 overflow-hidden">
                                        <div class="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm">Open</div>
                                        <div class="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm text-red-500">Delete</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="flex justify-between items-end mt-[36px]">
                                <div class="flex flex-col gap-[10px]">
                                    <p class="text-[14px] text-[#667085] font-medium">Shared Users</p>
                                    <div class="flex items-center">
                                        <div class="flex -space-x-[8px]">
                                            <img v-for="u in getAvatars(folder.sharedUsers).list" :src="u.avatar" class="w-[36px] h-[36px] rounded-xl border-[1.5px] border-white object-cover">
                                        </div>
                                        <div v-if="getAvatars(folder.sharedUsers).extra > 0" class="ml-[-6px] w-[36px] h-[36px] rounded-xl px-[8px] bg-[#F0F7FF] border-[1.5px] border-white flex items-center justify-center text-[10px] font-bold text-[#0061FF] z-10">+{{ getAvatars(folder.sharedUsers).extra }}</div>
                                    </div>
                                </div>
                                <div class="flex flex-col gap-[10px] items-start mr-[30px]">
                                    <p class="text-[14px] text-[#667085] font-medium">Inside Files</p>
                                    <div class="w-[78px] h-[36px] px-[12px] bg-[#F0F7FF] rounded-[8px] flex items-center justify-center text-[13px] font-bold text-[#0061FF]">
                                        {{ folder.insideFiles }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section>
                    <div class="mb-[24px]">
                        <h2 class="text-[24px] font-medium text-[#1E293B]">Recent Files</h2>
                    </div>
                    
                    <div class="bg-white rounded-[32px] border border-[#F1F5F9] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-visible">
                        <div class="overflow-x-auto">
                            <table class="w-full text-left min-w-[700px]">
                                <thead class="text-[14px] text-[#667085] font-medium font-semibold border-b border-[#F8FAFC]">
                                    <tr>
                                        <th @click="handleSort('name')" class="px-[32px] py-[20px] cursor-pointer hover:text-[#0061FF] select-none">
                                            <div class="flex items-center gap-1">
                                                Name 
                                                <img src="assets/icons/icon-sort.svg" class="w-[7px]">
                                            </div>
                                        </th>
                                        <th @click="handleSort('sharedUsers')" class="px-[32px] py-[20px] cursor-pointer hover:text-[#0061FF] select-none">
                                            <div class="flex items-center gap-1">
                                                Shared Users
                                                <img src="assets/icons/icon-sort.svg" class="w-[7px]">
                                            </div>
                                        </th>
                                        <th @click="handleSort('size')" class="px-[32px] py-[20px] cursor-pointer hover:text-[#0061FF] select-none">
                                            <div class="flex items-center gap-1">
                                                File Size 
                                                <img src="assets/icons/icon-sort.svg" class="w-[7px]">
                                            </div>
                                        </th>
                                        <th @click="handleSort('modifiedDate')" class="px-[32px] py-[20px] cursor-pointer hover:text-[#0061FF] select-none">
                                            <div class="flex items-center gap-1">
                                                Last Modified 
                                                <img src="assets/icons/icon-sort.svg" class="w-[7px]">
                                            </div>
                                        </th>
                                        <th class="px-[32px] py-[20px]"></th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-[#F8FAFC]">
                                    <tr v-for="file in filteredFiles" :key="file.id" class="hover:bg-[#F8FAFC]/50 transition">
                                        <td class="px-[32px] py-[24px] flex items-center gap-[16px]">
                                            <div class="w-[44px] h-[44px] rounded-[12px] flex items-center justify-center shrink-0" 
                                                 :class="file.type === 'image' ? 'bg-[#FFF2E5]' : file.type === 'video' ? 'bg-[#F5EBFF]' : 'bg-[#F0F7FF]'">
                                                <img :src="file.icon || 'assets/icons/icon-file.svg'" class="w-[20px]">
                                            </div>
                                            <span class="font-bold text-[#0061FF] text-[15px] cursor-pointer hover:underline">{{ file.name }}</span>
                                        </td>
                                        <td class="px-[32px] py-[24px]">
                                            <div class="flex -space-x-[8px]">
                                                <img v-for="u in getAvatars(file.sharedUsers).list" :src="u.avatar" class="w-[32px] h-[32px] rounded-xl border-2 border-white object-cover">
                                                <div v-if="getAvatars(file.sharedUsers).extra > 0" class="w-[32px] h-[32px] rounded-xl bg-[#F0F7FF] border-2 border-white flex items-center justify-center text-[10px] font-bold text-[#0061FF]">+{{ getAvatars(file.sharedUsers).extra }}</div>
                                            </div>
                                        </td>
                                        <td class="px-[32px] py-[24px] text-[15px] text-[#334155] font-medium">{{ file.size }}</td>
                                        <td class="px-[32px] py-[24px] text-[15px] text-[#334155] font-medium">{{ file.modifiedDate }}</td>
                                        <td class="px-[32px] py-[24px] text-right relative">
                                            <button @click.stop="toggleMenu('file-'+file.id)" class="text-[#CBD5E1] hover:text-[#667085] p-2">
                                                <img src="assets/icons/icon-more.svg" class="w-[4px] opacity-60">
                                            </button>
                                            <div v-if="activeMenuId === 'file-'+file.id" 
                                                 class="absolute right-[40px] top-[60px] w-[140px] bg-white shadow-xl rounded-[12px] border border-[#E2E8F0] z-50 py-2 text-left">
                                                <div class="px-4 py-2 hover:bg-[#F8FAFC] cursor-pointer text-sm">Download</div>
                                                <div class="px-4 py-2 hover:bg-[#F8FAFC] cursor-pointer text-sm text-red-500">Delete</div>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    </div>
    `
});
app.mount('#app');