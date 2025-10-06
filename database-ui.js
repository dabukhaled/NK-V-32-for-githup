
// واجهة إدارة قاعدة البيانات
function initializeDatabaseUI() {
    // التحقق من وجود عناصر واجهة المستخدم
    const settingsModal = document.getElementById('settings-modal');
    const settingsTabs = document.querySelector('.settings-tabs');

    if (!settingsModal || !settingsTabs) {
        console.error('لم يتم العثور على عناصر واجهة المستخدم اللازمة لإدارة قاعدة البيانات');
        return;
    }

    // إضافة تبويب قاعدة البيانات
    const databaseTab = document.createElement('button');
    databaseTab.className = 'tab-btn';
    databaseTab.setAttribute('data-tab', 'database');
    databaseTab.innerHTML = '<i class="fas fa-database"></i> قاعدة البيانات';
    settingsTabs.appendChild(databaseTab);

    // إضافة محتوى تبويب قاعدة البيانات
    const databaseTabContent = document.createElement('div');
    databaseTabContent.id = 'database-tab';
    databaseTabContent.className = 'tab-content';

    databaseTabContent.innerHTML = `
        <h3>إدارة قاعدة البيانات</h3>
        <div class="settings-section">
            <h4>استيراد البيانات</h4>
            <div class="form-group">
                <label>استيراد قاعدة البيانات من ملف JSON:</label>
                <div class="import-dropzone" id="db-import-dropzone">
                    <p>اسحب وأفلت ملف قاعدة البيانات هنا</p>
                    <p>أو</p>
                    <label for="db-import-file" class="btn">اختر ملفًا</label>
                    <input type="file" id="db-import-file" accept=".json">
                </div>
                <button id="import-db-btn" class="btn" style="margin-top: 10px;">استيراد البيانات</button>
            </div>
            <div class="form-group">
                <p class="info-text">سيتم استيراد جميع الأفلام والمسلسلات والأقسام والإعدادات من الملف المحدد.</p>
            </div>
        </div>

        <div class="settings-section">
            <h4>تصدير البيانات</h4>
            <div class="form-group">
                <label>تصدير قاعدة البيانات إلى ملف JSON:</label>
                <p class="info-text">سيتم تصدير جميع البيانات الحالية إلى ملف JSON يمكن استيراده لاحقًا.</p>
                <button id="export-db-btn" class="btn">تصدير قاعدة البيانات</button>
            </div>
        </div>

        <div class="settings-section">
            <h4>إدارة التخزين</h4>
            <div class="form-group">
                <button id="clear-local-storage" class="btn warning">مسح التخزين المحلي</button>
                <p class="info-text">سيتم مسح جميع البيانات المخزنة في المتصفح (localForage).</p>
            </div>
            <div class="form-group">
                <button id="backup-db-btn" class="btn">إنشاء نسخة احتياطية</button>
                <p class="info-text">سيتم إنشاء نسخة احتياطية من قاعدة البيانات الحالية وتنزيلها.</p>
            </div>
        </div>

        <div class="settings-actions">
            <button id="refresh-db-btn">تحديث قاعدة البيانات</button>
            <button id="reset-db-btn">إعادة تعيين قاعدة البيانات</button>
        </div>
    `;

    // إضافة المحتوى إلى نهاية إعدادات النموذج
    const settingsContent = document.getElementById('settings-content');
    settingsContent.appendChild(databaseTabContent);

    // إضافة معالجات الأحداث
    setupDatabaseEventHandlers();
}

// إعداد معالجات أحداث قاعدة البيانات
function setupDatabaseEventHandlers() {
    // معالج استيراد قاعدة البيانات
    const importDbBtn = document.getElementById('import-db-btn');
    const dbImportFile = document.getElementById('db-import-file');
    const dbImportDropzone = document.getElementById('db-import-dropzone');

    if (importDbBtn) {
        importDbBtn.addEventListener('click', async () => {
            const file = dbImportFile.files[0];
            if (!file) {
                showNotification('يرجى اختيار ملف للاستيراد');
                return;
            }

            try {
                if (typeof DatabaseManager !== 'undefined') {
                    await DatabaseManager.importAppData(file);
                } else {
                    showNotification('نظام قاعدة البيانات غير متوفر');
                }
            } catch (error) {
                console.error('خطأ أثناء استيراد قاعدة البيانات:', error);
                showNotification('حدث خطأ أثناء استيراد قاعدة البيانات: ' + error.message);
            }
        });
    }

    // معالج تصدير قاعدة البيانات
    const exportDbBtn = document.getElementById('export-db-btn');
    if (exportDbBtn && typeof DatabaseManager !== 'undefined') {
        exportDbBtn.addEventListener('click', () => {
            try {
                // تحضير بيانات قاعدة البيانات
                const dbData = {
                    version: "1.0",
                    movies: appState.movies,
                    series: appState.series,
                    categories: appState.categories,
                    settings: {
                        password: appState.password,
                        showSpecialSections: appState.showSpecialSections,
                        viewMode: appState.viewMode,
                        sortBy: appState.sortBy,
                        selectedSite: appState.selectedSite,
                        selectedStar: appState.selectedStar,
                        itemsPerPage: appState.itemsPerPage,
                        openMoviesExternally: appState.openMoviesExternally,
                        zoomLevel: appState.zoomLevel,
                        currentPageTitle: appState.currentPageTitle
                    }
                };

                // إنشاء ملف مؤقت للتنزيل
                const dataStr = JSON.stringify(dbData, null, 2);
                const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

                const exportFileDefaultName = 'app_database_export.json';

                const linkElement = document.createElement('a');
                linkElement.setAttribute('href', dataUri);
                linkElement.setAttribute('download', exportFileDefaultName);
                linkElement.click();

                showNotification('تم تصدير قاعدة البيانات بنجاح');
            } catch (error) {
                console.error('خطأ أثناء تصدير قاعدة البيانات:', error);
                showNotification('حدث خطأ أثناء تصدير قاعدة البيانات: ' + error.message);
            }
        });
    }

    // معالج مسح التخزين المحلي
    const clearLocalStorageBtn = document.getElementById('clear-local-storage');
    if (clearLocalStorageBtn) {
        clearLocalStorageBtn.addEventListener('click', () => {
            if (confirm('هل أنت متأكد من أنك تريد مسح جميع البيانات المخزنة في المتصفح؟ هذه العملية لا يمكن التراجع عنها.')) {
                try {
                    localforage.clear().then(() => {
                        showNotification('تم مسح التخزين المحلي بنجاح');
                        // إعادة تحميل الصفحة لتفعيل التغييرات
                        setTimeout(() => {
                            location.reload();
                        }, 1500);
                    }).catch(error => {
                        console.error('خطأ أثناء مسح التخزين المحلي:', error);
                        showNotification('حدث خطأ أثناء مسح التخزين المحلي');
                    });
                } catch (error) {
                    console.error('خطأ أثناء مسح التخزين المحلي:', error);
                    showNotification('حدث خطأ أثناء مسح التخزين المحلي');
                }
            }
        });
    }

    // معالج إنشاء نسخة احتياطية
    const backupDbBtn = document.getElementById('backup-db-btn');
    if (backupDbBtn) {
        backupDbBtn.addEventListener('click', () => {
            try {
                // تحضير بيانات قاعدة البيانات
                const dbData = {
                    version: "1.0",
                    movies: appState.movies,
                    series: appState.series,
                    categories: appState.categories,
                    settings: {
                        password: appState.password,
                        showSpecialSections: appState.showSpecialSections,
                        viewMode: appState.viewMode,
                        sortBy: appState.sortBy,
                        selectedSite: appState.selectedSite,
                        selectedStar: appState.selectedStar,
                        itemsPerPage: appState.itemsPerPage,
                        openMoviesExternally: appState.openMoviesExternally,
                        zoomLevel: appState.zoomLevel,
                        currentPageTitle: appState.currentPageTitle,
                        backupDate: new Date().toISOString()
                    }
                };

                // إنشاء ملف مؤقت للتنزيل
                const dataStr = JSON.stringify(dbData, null, 2);
                const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

                const exportFileDefaultName = `app_database_backup_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;

                const linkElement = document.createElement('a');
                linkElement.setAttribute('href', dataUri);
                linkElement.setAttribute('download', exportFileDefaultName);
                linkElement.click();

                showNotification('تم إنشاء النسخة الاحتياطية بنجاح');
            } catch (error) {
                console.error('خطأ أثناء إنشاء النسخة الاحتياطية:', error);
                showNotification('حدث خطأ أثناء إنشاء النسخة الاحتياطية: ' + error.message);
            }
        });
    }

    // معالج تحديث قاعدة البيانات
    const refreshDbBtn = document.getElementById('refresh-db-btn');
    if (refreshDbBtn) {
        refreshDbBtn.addEventListener('click', () => {
            showNotification('جاري تحديث قاعدة البيانات...');
            setTimeout(() => {
                location.reload();
            }, 1000);
        });
    }

    // معالج إعادة تعيين قاعدة البيانات
    const resetDbBtn = document.getElementById('reset-db-btn');
    if (resetDbBtn) {
        resetDbBtn.addEventListener('click', () => {
            if (confirm('هل أنت متأكد من أنك تريد إعادة تعيين قاعدة البيانات؟ سيتم حذف جميع البيانات الحالية وسيتم استبدالها بالبيانات الافتراضية. هذه العملية لا يمكن التراجع عنها.')) {
                try {
                    if (typeof DatabaseManager !== 'undefined') {
                        // إعادة تعيين البيانات إلى القيم الافتراضية
                        appState.movies = [];
                        appState.series = [];
                        appState.categories = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
                        appState.password = '5555';
                        appState.showSpecialSections = false;
                        appState.viewMode = 'grid';
                        appState.sortBy = 'name';
                        appState.selectedSite = '';
                        appState.selectedStar = '';
                        appState.itemsPerPage = 50;
                        appState.openMoviesExternally = true;
                        appState.zoomLevel = 1;
                        appState.currentPageTitle = 'New Koktil-aflam v32';

                        // تحديث العرض
                        updateCategoriesCounts();
                        renderCategories();
                        displayMovies('all', 1);

                        // إخفاء/إظهار الأقسام الخاصة بناءً على الإعدادات
                        toggleSpecialSectionsVisibility();

                        // تطبيق مستوى التكبير المحفوظ
                        applyZoom();

                        // حفظ البيانات
                        saveAppData();

                        showNotification('تم إعادة تعيين قاعدة البيانات بنجاح');
                    } else {
                        showNotification('نظام قاعدة البيانات غير متوفر');
                    }
                } catch (error) {
                    console.error('خطأ أثناء إعادة تعيين قاعدة البيانات:', error);
                    showNotification('حدث خطأ أثناء إعادة تعيين قاعدة البيانات: ' + error.message);
                }
            }
        });
    }

    // معالج السحب والإفلة لمنطقة الاستيراد
    if (dbImportDropzone) {
        dbImportDropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dbImportDropzone.classList.add('dragover');
        });

        dbImportDropzone.addEventListener('dragleave', () => {
            dbImportDropzone.classList.remove('dragover');
        });

        dbImportDropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dbImportDropzone.classList.remove('dragover');

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                dbImportFile.files = files;
            }
        });
    }

    // تبديل تبويبات الإعدادات
    document.querySelectorAll('.settings-tabs .tab-btn').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');

            // إزالة الفعالية من جميع الأزرار
            document.querySelectorAll('.settings-tabs .tab-btn').forEach(t => t.classList.remove('active'));

            // إضافة الفعالية للزر الحالي
            tab.classList.add('active');

            // إخفاء جميع المحتويات
            document.querySelectorAll('#settings-content .tab-content').forEach(content => {
                content.classList.add('hidden');
            });

            // إظهار المحتوى المناسب
            const targetContent = document.getElementById(`${tabId}-tab`);
            if (targetContent) {
                targetContent.classList.remove('hidden');
            }
        });
    });
}

// استدعاء تهيئة واجهة قاعدة البيانات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    // تأكد من تحميل appState
    if (typeof appState !== 'undefined') {
        initializeDatabaseUI();
    } else {
        // في حالة عدم وجود appState، انتظر حتى يتم تحميلها
        setTimeout(initializeDatabaseUI, 500);
    }
});
