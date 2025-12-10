import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Upload, FileText, CheckCircle, Award } from 'lucide-react';
import { processPdfDictionary, ExtractedVocabulary } from '../services/pdfProcessor';
import { addVocabulary, updateUserStats } from '../services/firebase';

const ProfilePage: React.FC = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || file.type !== 'application/pdf') {
      alert('Por favor envie apenas arquivos PDF.');
      return;
    }

    setIsProcessing(true);
    setUploadStatus(`Lendo ${file.name}...`);

    try {
      const vocabulary: ExtractedVocabulary[] = await processPdfDictionary(file);
      
      setUploadStatus(`Extraindo ${vocabulary.length} palavras...`);
      
      // Batch upload (simplified for demo)
      let count = 0;
      for (const entry of vocabulary) {
        await addVocabulary({
          ...entry,
          targetLang: 'pt', // Default assumption for this PDF processor
          source: 'pdf',
          uploadedBy: currentUser?.uid,
          frequency: 0
        });
        count++;
      }

      await updateUserStats(currentUser!.uid, 'pdfsUploaded', 1);
      await updateUserStats(currentUser!.uid, 'wordsContributed', count);

      setUploadStatus(`✅ Sucesso! ${count} palavras adicionadas.`);
    } catch (error) {
      console.error(error);
      setUploadStatus('❌ Erro ao processar PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!currentUser) return <div>Carregando...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl p-6 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src={currentUser.photoURL || `https://ui-avatars.com/api/?name=${currentUser.displayName}`} alt="Avatar" className="w-16 h-16 rounded-full border-4 border-brand-primary/20" />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{currentUser.displayName}</h2>
            <p className="text-gray-500">{currentUser.email}</p>
            <div className="flex gap-2 mt-2">
               <span className="px-2 py-0.5 bg-brand-secondary/10 text-brand-secondary text-xs rounded-full font-bold uppercase">
                 {userProfile?.plan || 'Free'}
               </span>
               {userProfile?.isContributor && (
                 <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full font-bold flex items-center gap-1">
                   <Award className="w-3 h-3" /> Contribuidor
                 </span>
               )}
            </div>
          </div>
        </div>
        <button onClick={logout} className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg font-medium">Sair</button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Contribuição Card */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-brand-primary">
          <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
            <FileText className="text-brand-primary" />
            Envie Dicionários PDF
          </h3>
          <p className="text-gray-600 mb-6 text-sm">
            Ajude a IA a aprender! Envie dicionários (Crioulo -> Português) em PDF.
            O sistema extrai automaticamente o vocabulário.
          </p>
          
          <label className={`
            border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors
            ${isProcessing ? 'bg-gray-50 opacity-50 cursor-not-allowed' : 'hover:border-brand-primary hover:bg-brand-primary/5'}
          `}>
            <input type="file" className="hidden" accept=".pdf" onChange={handleFileUpload} disabled={isProcessing} />
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm font-medium text-gray-600">Clique para enviar PDF</span>
          </label>
          
          {uploadStatus && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm font-medium text-center">
              {uploadStatus}
            </div>
          )}
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-yellow-400">
           <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Award className="text-yellow-500" />
            Suas Conquistas
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Traduções realizadas</span>
              <span className="font-bold text-xl">{userProfile?.translationsUsed || 0}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">PDFs Enviados</span>
              <span className="font-bold text-xl">{userProfile?.pdfsUploaded || 0}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Palavras contribuídas</span>
              <span className="font-bold text-xl text-green-600">+{userProfile?.wordsContributed || 0}</span>
            </div>
          </div>
          
          {(userProfile?.wordsContributed || 0) > 100 && (
             <div className="mt-4 flex items-center gap-2 text-yellow-600 bg-yellow-50 p-2 rounded text-sm font-bold">
               <CheckCircle className="w-4 h-4" />
               Badge: Contribuidor Ouro
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;