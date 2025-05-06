import { SheetUploadRequestDto, SheetUploadResponseDto } from '@shared/types/dtos';

/**
 * 악보 파일 업로드 유틸리티 함수
 * Electron 환경과 브라우저 환경 모두에서 사용 가능
 */
export const uploadSheetMusic = async (
  uploadRequest: SheetUploadRequestDto
): Promise<SheetUploadResponseDto> => {
  try {
    // Electron 환경인지 확인
    if (typeof window.electron !== 'undefined') {
      // Electron IPC를 통해 파일 업로드
      const result = (await window.electron.ipcRenderer.invoke(
        'upload-sheet',
        uploadRequest
      )) as SheetUploadResponseDto;

      if (!result.success) {
        console.error('악보 업로드 실패:', result.error);
        throw new Error(result.error || '알 수 없는 오류');
      }

      console.log('악보 업로드 성공:', result.sheet);
      return result;
    } else {
      // 브라우저 환경에서는 서버 API를 통해 업로드
      console.log('브라우저 환경에서 업로드 시도:', {
        title: uploadRequest.title,
        date: uploadRequest.date,
        serviceType: uploadRequest.serviceType,
        fileName: uploadRequest.fileName,
      });

      // 서버 API를 통한 업로드 로직
      const apiUrl = 'http://localhost:3001/api/upload-sheet'; // 직접 Electron 서버에 연결

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify(uploadRequest),
      });

      const result = (await response.json()) as SheetUploadResponseDto;

      if (!response.ok || !result.success) {
        console.error('악보 업로드 실패:', result.error);
        throw new Error(result.error || '업로드 실패');
      }

      console.log('악보 업로드 성공:', result.sheet);
      return result;
    }
  } catch (error) {
    console.error('업로드 중 오류:', error);
    throw error;
  }
};
