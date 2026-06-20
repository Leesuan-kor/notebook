document.addEventListener("DOMContentLoaded", function () {
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxvFKqeSiRVNSdxW-Bvte0MvjBSiQQGoJohksRkoXl_ofGwk-8ENs3B3xRYODtWAaYy/exec";

    // 1. URL에서 파라미터 추출하기 (?user=...&ip=...&pcname=...)
    const urlParams = new URLSearchParams(window.location.search);
    const userParam = urlParams.get('user') || "";
    const ipParam = urlParams.get('ip') || "";
    const pcnameParam = urlParams.get('pcname') || "";

    // DOM 요소 가져오기
    const txtUser = document.getElementById('txt-user');
    const txtIp = document.getElementById('txt-ip');
    const txtPcName = document.getElementById('txt-pcname');
    const actionSection = document.getElementById('action-section');
    const btnGenerate = document.getElementById('btn-generate');
    const inputNewName = document.getElementById('new-name');
    const resultBox = document.getElementById('result-box');
    const codeOutput = document.getElementById('code-output');
    const btnCopy = document.getElementById('btn-copy');

    // 2. 파라미터 유무에 따른 데이터 뿌려주기
    if (userParam && ipParam && pcnameParam) {
        txtUser.textContent = decodeURIComponent(userParam);
        txtUser.classList.remove('loading');
        
        txtIp.textContent = ipParam;
        txtIp.classList.remove('loading');
        
        txtPcName.textContent = decodeURIComponent(pcnameParam);
        txtPcName.classList.remove('loading');

        actionSection.classList.remove('hidden');
    } else {
        txtUser.textContent = "스크립트 미실행";
        txtIp.textContent = "스크립트 미실행";
        txtPcName.textContent = "스크립트 미실행";
        alert("이 페이지는 전용 안내 스크립트를 통해 실행해야 정상적으로 작동합니다.");
    }

    // 3. 명령어 생성 및 구글 스프레드시트 저장 데이터 전송
    btnGenerate.addEventListener('click', function () {
        const nameInput = inputNewName.value.trim();
        
        if (!nameInput) {
            alert("선생님의 성함을 입력해 주세요.");
            inputNewName.focus();
            return;
        }

        const finalPcName = `${nameInput}-노트북`;
        const powershellCmd = `Rename-Computer -NewName "${finalPcName}" -Force -Restart`;

        // 화면에 명령어 노출
        codeOutput.textContent = powershellCmd;
        resultBox.classList.remove('hidden');

        // [추가된 기능] 구글 스프레드시트로 전송할 데이터 조립
        const payload = {
            user: decodeURIComponent(userParam),
            ip: ipParam,
            pcname: decodeURIComponent(pcnameParam),
            newName: finalPcName
        };

        // 구글 시트로 백엔드 전송 (비동기 처리)
        btnGenerate.disabled = true;
        btnGenerate.textContent = "정보 저장 중...";

        fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            mode: "no-cors", // CORS(보안정책) 우회를 위해 no-cors 설정
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        })
        .then(() => {
            // 보낸 후 버튼 상태 원복
            btnGenerate.disabled = false;
            btnGenerate.textContent = "이름 변경 코드 생성";
            console.log("구글 시트에 성공적으로 기록 요청을 보냈습니다.");
        })
        .catch(err => {
            btnGenerate.disabled = false;
            btnGenerate.textContent = "이름 변경 코드 생성";
            console.error("데이터 전송 실패:", err);
        });
    });

    // 4. 클립보드 복사 기능
    btnCopy.addEventListener('click', function () {
        const textToCopy = codeOutput.textContent;
        
        navigator.clipboard.writeText(textToCopy).then(() => {
            alert("명령어가 복사되었습니다! 안내에 따라 PowerShell 창에 붙여넣어 주세요.");
        }).catch(err => {
            alert("복사에 실패했습니다. 마우스로 직접 드래그하여 복사해 주세요.");
        });
    });
});
