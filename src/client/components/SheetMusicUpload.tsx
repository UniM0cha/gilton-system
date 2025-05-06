import React, { useState } from 'react';
import { Button } from '@client/components/ui/button';
import { Input } from '@client/components/ui/input';
import { Label } from '@client/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@client/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@client/components/ui/card';
import { SheetUploadRequestDto } from '@shared/types/dtos';
import { uploadSheetMusic } from '@client/utils/uploadUtils';

interface SheetMusicUploadProps {
  onUploadComplete?: () => void;
}

const SheetMusicUpload: React.FC<SheetMusicUploadProps> = ({ onUploadComplete }) => {
  // 업로드 상태
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadDate, setUploadDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [uploadServiceType, setUploadServiceType] = useState<string>('주일 1부예배');
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // 파일 선택 처리
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);

      // 모든 파일이 이미지인지 확인
      const nonImageFiles = files.filter((file) => !file.type.startsWith('image/'));
      if (nonImageFiles.length > 0) {
        alert('이미지 파일만 업로드 가능합니다 (PNG, JPG)');
        return;
      }

      setUploadFiles(files);
    }
  };

  // 업로드 처리
  const handleUpload = async () => {
    if (uploadFiles.length === 0 || !uploadTitle.trim() || !uploadDate || !uploadServiceType) {
      alert('제목, 날짜, 예배 종류, 파일을 모두 입력해주세요.');
      return;
    }

    setIsUploading(true);

    try {
      // 각 파일 처리
      for (const file of uploadFiles) {
        await new Promise<void>((resolve, reject) => {
          const reader = new FileReader();

          reader.onload = async (event) => {
            if (!event.target || typeof event.target.result !== 'string') {
              reject(new Error('파일 읽기 실패'));
              return;
            }

            const imageData = event.target.result;

            // 공통 업로드 유틸리티 함수 사용
            try {
              const uploadRequest: SheetUploadRequestDto = {
                title: uploadTitle,
                date: uploadDate,
                serviceType: uploadServiceType,
                fileName: file.name,
                imageData,
              };

              await uploadSheetMusic(uploadRequest);

              resolve();
            } catch (error) {
              console.error('업로드 중 오류:', error);
              reject(error);
            }
          };

          reader.onerror = () => {
            reject(new Error('파일 읽기 실패'));
          };

          reader.readAsDataURL(file);
        });
      }

      alert('악보가 업로드되었습니다.');
      setUploadTitle('');
      setUploadFiles([]);
      setIsUploadModalOpen(false);

      // 업로드 완료 콜백 호출
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      console.error('업로드 오류:', error);
      alert('업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setIsUploadModalOpen(true)} className="ml-2">
        악보 업로드
      </Button>

      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle>악보 업로드</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="upload-title">악보 제목</Label>
                <Input
                  id="upload-title"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="악보 제목을 입력하세요"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="upload-date">날짜</Label>
                <Input
                  id="upload-date"
                  type="date"
                  value={uploadDate}
                  onChange={(e) => setUploadDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="upload-service-type">예배 종류</Label>
                <Select value={uploadServiceType} onValueChange={setUploadServiceType}>
                  <SelectTrigger id="upload-service-type">
                    <SelectValue placeholder="예배 종류를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="주일 1부예배">주일 1부예배</SelectItem>
                    <SelectItem value="주일 2부예배">주일 2부예배</SelectItem>
                    <SelectItem value="주일 3부예배">주일 3부예배</SelectItem>
                    <SelectItem value="청년 예배">청년 예배</SelectItem>
                    <SelectItem value="수요예배">수요예배</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="upload-files">악보 파일 (PNG, JPG)</Label>
                <Input
                  id="upload-files"
                  type="file"
                  accept="image/png, image/jpeg"
                  onChange={handleFileChange}
                  multiple
                />
                {uploadFiles.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">선택된 파일 ({uploadFiles.length}개):</p>
                    <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                      {uploadFiles.map((file, index) => (
                        <li key={index}>{file.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsUploadModalOpen(false)} disabled={isUploading}>
                  취소
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={isUploading || uploadFiles.length === 0 || !uploadTitle.trim()}
                >
                  {isUploading ? '업로드 중...' : '업로드'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default SheetMusicUpload;
