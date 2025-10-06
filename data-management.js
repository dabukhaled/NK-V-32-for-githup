
// إدارة البيانات المحلية

// دالة لتحميل البيانات من ملف app_database.json عند بدء التطبيق
async function loadDataFromFile() {
    try {
        const response = await fetch('app_database.json');
        if (!response.ok) {
            throw new Error('ملف البيانات غير موجود');
        }

        const data = await response.json();
        if (isValidDatabase(data)) {
            // تحميل البيانات
            appState.movies = data.movies || [];
            appState.series = data.series || [];
            appState.categories = data.categories || JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));

            // تحميل الإعدادات
            if (data.settings) {
                appState.password = data.settings.password || '5555';
                appState.showSpecialSections = data.settings.showSpecialSections || false;
                appState.viewMode = data.settings.viewMode || 'grid';
                appState.sortBy = data.settings.sortBy || 'name';
                appState.selectedSite = data.settings.selectedSite || '';
                appState.selectedStar = data.settings.selectedStar || '';
                appState.itemsPerPage = data.settings.itemsPerPage || 50;
                appState.openMoviesExternally = data.settings.openMoviesExternally !== undefined ? data.settings.openMoviesExternally : true;
                appState.zoomLevel = data.settings.zoomLevel || 1;
                appState.currentPageTitle = data.settings.currentPageTitle || 'New Koktil-aflam v32';
            }

            // تحديث الواجهة
            updateCategoriesCounts();
            renderCategories();
            displayMovies(appState.currentCategory || 'all', 1);
            toggleSpecialSectionsVisibility();
            applyZoom();

            showNotification('تم تحميل البيانات من ملف app_database.json بنجاح');
            return true;
        } else {
            throw new Error('ملف البيانات غير صالح');
        }
    } catch (error) {
        console.log('فشل تحميل البيانات من الملف:', error);
        return false;
    }
}

// دالة لعرض البيانات المحلية
function displayLocalData() {
    if (!appState.movies || !appState.categories) {
        showNotification('لا توجد بيانات لعرضها');
        return;
    }

    // إنشاء نافذة منبثقة لعرض البيانات
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'data-display-modal';

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>عرض البيانات المحلية</h3>
                <span class="close-btn">&times;</span>
            </div>
            <div class="modal-body">
                <div class="data-summary">
                    <p>عدد الأفلام: <span class="highlight">${appState.movies.length}</span></p>
                    <p>عدد المسلسلات: <span class="highlight">${appState.series.length}</span></p>
                    <p>أخر تحديث: <span class="highlight">${new Date().toLocaleString('ar-EG')}</span></p>
                </div>
                <div class="data-tabs">
                    <button class="tab-btn active" data-tab="movies">الأفلام</button>
                    <button class="tab-btn" data-tab="series">المسلسلات</button>
                    <button class="tab-btn" data-tab="categories">الأقسام</button>
                </div>
                <div class="tab-content">
                    <div id="movies-tab" class="data-tab active">
                        <div class="data-list">
                            ${appState.movies.slice(0, 10).map(movie => `
                                <div class="data-item">
                                    <span class="data-name">${movie.name}</span>
                                    <span class="data-category">${getCategoryName(movie.category)}</span>
                                </div>
                            `).join('')}
                            ${appState.movies.length > 10 ? `<p class="more-items">... و ${appState.movies.length - 10} فيلم آخر</p>` : ''}
                        </div>
                    </div>
                    <div id="series-tab" class="data-tab">
                        <div class="data-list">
                            ${appState.series.slice(0, 10).map(series => `
                                <div class="data-item">
                                    <span class="data-name">${series.name}</span>
                                    <span class="data-category">${getCategoryName(series.category)}</span>
                                </div>
                            `).join('')}
                            ${appState.series.length > 10 ? `<p class="more-items">... و ${appState.series.length - 10} مسلسل آخر</p>` : ''}
                        </div>
                    </div>
                    <div id="categories-tab" class="data-tab">
                        <div class="data-list">
                            ${appState.categories.main.map(cat => `
                                <div class="data-item">
                                    <span class="data-name">${cat.name}</span>
                                    <span class="data-count">${cat.count} عنصر</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // إضافة النافذة إلى الصفحة
    document.body.appendChild(modal);

    // إغلاق النافذة
    const closeBtn = modal.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => {
        modal.remove();
    });

    // تبديل بين الألسنة
    const tabBtns = modal.querySelectorAll('.tab-btn');
    const tabContents = modal.querySelectorAll('.data-tab');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');

            // تحديث الأزرار النشطة
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // تحديث المحتوى النشط
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId + '-tab') {
                    content.classList.add('active');
                }
            });
        });
    });
}

// دالة مساعدة للحصول على اسم القسم
function getCategoryName(categoryId) {
    const category = [...appState.categories.main, ...appState.categories.sub, 
                    ...appState.categories.special, ...appState.categories.specialSub]
                    .find(cat => cat.id === categoryId);
    return category ? category.name : categoryId;
}

// التحقق من صحة بنية قاعدة البيانات
function isValidDatabase(data) {
    return data &&
           data.movies && Array.isArray(data.movies) &&
           data.categories &&
           data.categories.main && Array.isArray(data.categories.main) &&
           data.categories.sub && Array.isArray(data.categories.sub) &&
           data.categories.special && Array.isArray(data.categories.special) &&
           data.categories.specialSub && Array.isArray(data.categories.specialSub) &&
           data.settings;
}

// إضافة زر عرض البيانات إلى الواجهة الرئيسية
function addDataDisplayButton() {
    // البحث عن منطقة الأزرار في الواجهة الرئيسية
    const headerBottom = document.querySelector('.header-bottom');

    if (headerBottom) {
        // إنشاء حاوية للأزرار الجديدة
        const newButtonsContainer = document.createElement('div');
        newButtonsContainer.className = 'new-buttons-container';

        // إنشاء زر عرض البيانات
        const dataDisplayBtn = document.createElement('button');
        dataDisplayBtn.id = 'data-display-btn';
        dataDisplayBtn.innerHTML = '<i class="fas fa-database"></i> عرض البيانات';
        dataDisplayBtn.className = 'data-display-btn';
        dataDisplayBtn.title = 'عرض البيانات المحلية من ملف app_database.json';

        // إضافة وظيفة للنقر على الزر
        dataDisplayBtn.addEventListener('click', displayLocalData);

        // إضافة الزر إلى الحاوية
        newButtonsContainer.appendChild(dataDisplayBtn);

        // إضافة الحاوية إلى منطقة الأزرار
        headerBottom.appendChild(newButtonsContainer);

        console.log('تمت إضافة زر عرض البيانات بنجاح');
    } else {
        console.error('لم يتم العثور على منطقة الأزرار في الواجهة الرئيسية');
    }
}

// تهيئة إدارة البيانات
function initializeDataManagement() {
    try {
        // إضافة زر عرض البيانات
        addDataDisplayButton();

        // محاولة تحميل البيانات من الملف عند بدء التطبيق
        setTimeout(async () => {
            const dataLoaded = await loadDataFromFile();
            if (!dataLoaded) {
                console.log('لم يتم العثور على ملف البيانات أو البيانات غير صالحة');
            }
        }, 1000);

        console.log('تم تهيئة إدارة البيانات بنجاح');
    } catch (error) {
        console.error('حدث خطأ أثناء تهيئة إدارة البيانات:', error);
    }
}

// استدعاء التهيئة عند تحميل الصفحة
window.addEventListener('load', initializeDataManagement);
